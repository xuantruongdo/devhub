"use client";

import { CALL_TIMEOUT, CallEndReason, CallStatus } from "@/constants";
import {
  AnswerPayload,
  IceCandidatePayload,
  OfferPayload,
} from "@/types/webrtc";
import { useEffect, useRef, useState, useCallback } from "react";
import { Socket } from "socket.io-client";

interface UseWebRTCOptions {
  socket: Socket;
  currentUserId: number;
  conversationId: number;
}

// Cấu hình STUN server giúp 2 peer tìm được địa chỉ public của nhau (NAT traversal)
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRTC({
  socket,
  currentUserId,
  conversationId,
}: UseWebRTCOptions) {
  // Trạng thái hiện tại của cuộc gọi: IDLE / CALLING / RECEIVING / CONNECTED / ENDED
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.IDLE);

  // Stream camera + mic của chính mình, dùng để hiển thị local video
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Stream camera + mic của đối phương, dùng để hiển thị remote video
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Mic đang tắt
  const [isMuted, setIsMuted] = useState(false);

  // Camera đang tắt
  const [isCameraOff, setIsCameraOff] = useState(false);

  // ID của người đang gọi đến mình (dùng để reject / hiển thị UI)
  const [incomingCallFrom, setIncomingCallFrom] = useState<number | null>(null);

  // ID conversation của cuộc gọi đến, nhận từ offer payload
  const [incomingConversationId, setIncomingConversationId] = useState<
    number | null
  >(null);

  // Tên người gọi đến, nhận từ offer payload để hiển thị trên UI
  const [callerName, setCallerName] = useState<string | null>(null);

  // Lý do cuộc gọi kết thúc: ENDED / REJECTED / TIMEOUT
  const [endReason, setEndReason] = useState<CallEndReason | null>(null);

  // RTCPeerConnection chính, quản lý toàn bộ kết nối WebRTC
  const pcRef = useRef<RTCPeerConnection | null>(null);

  // Giữ reference của localStream để dùng trong các callback mà không cần dependency
  const localStreamRef = useRef<MediaStream | null>(null);

  // Hàng chờ ICE candidate đến trước khi setRemoteDescription xong
  // Sẽ được flush ngay sau khi setRemoteDescription thành công
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  // Timeout tự động kết thúc cuộc gọi nếu đối phương không bắt máy
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lưu offer nhận được khi có người gọi đến, dùng lại khi acceptCall
  const pendingOfferRef = useRef<{
    callerId: number;
    offer: RTCSessionDescriptionInit;
  } | null>(null);

  // ID của người kia trong cuộc gọi (dù mình gọi hay nhận)
  // Dùng để endCall từ overlay mà không cần prop drilling
  const otherUserIdRef = useRef<number | null>(null);

  // Dọn dẹp toàn bộ state và resource sau khi cuộc gọi kết thúc
  const cleanup = useCallback(
    (reason?: CallEndReason) => {
      // Đóng RTCPeerConnection, giải phóng kết nối
      pcRef.current?.close();
      pcRef.current = null;

      // Dừng tất cả track của local stream (tắt camera + mic ở hệ điều hành)
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;

      // Dừng tất cả track của remote stream
      remoteStream?.getTracks().forEach((t) => t.stop());

      // Reset toàn bộ state về giá trị mặc định
      setLocalStream(null);
      setRemoteStream(null);
      setIncomingCallFrom(null);
      setIncomingConversationId(null);
      setIsMuted(false);
      setIsCameraOff(false);
      setCallerName(null);

      // Reset các ref
      otherUserIdRef.current = null;
      pendingCandidates.current = [];
      pendingOfferRef.current = null;

      // Hủy timeout chờ bắt máy nếu còn đang chạy
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      // Hiển thị trạng thái ENDED trong 1.5s rồi về IDLE để dialog có thời gian show lý do
      setCallStatus(CallStatus.ENDED);
      if (reason) setEndReason(reason);

      setTimeout(() => {
        setCallStatus(CallStatus.IDLE);
        setEndReason(null);
      }, 1500);
    },
    [remoteStream],
  );

  // Kết thúc cuộc gọi từ phía mình: thông báo đối phương rồi cleanup
  const endCall = useCallback(
    (targetUserId: number) => {
      socket.emit("call:end", { conversationId, targetUserId });
      cleanup(CallEndReason.ENDED);
    },
    [socket, conversationId, cleanup],
  );

  // Từ chối cuộc gọi đến: thông báo đối phương rồi cleanup
  const rejectCall = useCallback(
    (targetUserId: number) => {
      socket.emit("call:reject", { conversationId, targetUserId });
      cleanup(CallEndReason.REJECTED);
    },
    [socket, conversationId, cleanup],
  );

  // Tạo RTCPeerConnection mới và gắn các handler cần thiết
  const createPeerConnection = useCallback(
    (targetUserId: number) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Khi có ICE candidate mới → gửi sang đối phương qua socket để họ add vào pc của họ
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          socket.emit("call:ice-candidate", {
            conversationId,
            targetUserId,
            candidate: candidate.toJSON(),
          });
        }
      };

      // Khi nhận được stream từ đối phương → lưu vào state và chuyển sang CONNECTED
      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (stream) {
          setRemoteStream(stream);
          setCallStatus(CallStatus.CONNECTED);
        }
      };

      // Theo dõi trạng thái kết nối P2P, tự cleanup khi mất kết nối
      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          cleanup(CallEndReason.ENDED);
        }
      };

      pcRef.current = pc;
      return pc;
    },
    [socket, conversationId, cleanup],
  );

  // Lấy camera + mic của user, cache lại trong ref để tránh xin quyền nhiều lần
  const getLocalMedia = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  // Khởi tạo cuộc gọi: lấy media → tạo offer → gửi qua socket
  const startCall = useCallback(
    async (targetUserId: number, callerDisplayName: string) => {
      try {
        // Chặn spam, chỉ cho gọi khi đang IDLE
        if (callStatus !== CallStatus.IDLE) return;

        // Lưu lại để overlay dùng khi end call
        otherUserIdRef.current = targetUserId;
        setCallStatus(CallStatus.CALLING);

        const stream = await getLocalMedia();
        const pc = createPeerConnection(targetUserId);

        // Thêm local tracks vào pc để gửi sang đối phương
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Tạo SDP offer mô tả media capabilities của mình
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("call:offer", {
          conversationId,
          targetUserId,
          callerId: currentUserId,
          callerName: callerDisplayName,
          offer,
        });

        // Tự hủy cuộc gọi nếu đối phương không bắt máy sau CALL_TIMEOUT ms
        callTimeoutRef.current = setTimeout(() => {
          socket.emit("call:end", { conversationId, targetUserId });
          cleanup(CallEndReason.TIMEOUT);
        }, CALL_TIMEOUT);
      } catch (err) {
        console.error("startCall error:", err);
        cleanup();
      }
    },
    [
      socket,
      currentUserId,
      conversationId,
      getLocalMedia,
      createPeerConnection,
      cleanup,
      callStatus,
    ],
  );

  // Chấp nhận cuộc gọi đến: lấy media → set remote description → gửi answer
  const acceptCall = useCallback(async () => {
    try {
      const pending = pendingOfferRef.current;
      if (!pending) return;

      const { callerId, offer } = pending;

      const stream = await getLocalMedia();
      const pc = createPeerConnection(callerId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Set offer của người gọi làm remote description
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      // Flush các ICE candidate đã nhận trước khi setRemoteDescription
      for (const c of pendingCandidates.current) {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      }
      pendingCandidates.current = [];

      // Tạo SDP answer và gửi lại cho người gọi
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("call:answer", {
        conversationId,
        targetUserId: callerId,
        answer,
      });

      // Hủy timeout (nếu có) vì đã accept
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
    } catch (err) {
      console.error("acceptCall error:", err);
      cleanup();
    }
  }, [socket, conversationId, getLocalMedia, createPeerConnection, cleanup]);

  // Bật / tắt mic bằng cách toggle enabled trên audio tracks
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsMuted((v) => !v);
  }, []);

  // Bật / tắt camera bằng cách toggle enabled trên video tracks
  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setIsCameraOff((v) => !v);
  }, []);

  // Trả về ID người kia để overlay gọi endCall mà không cần prop drilling
  const getOtherUserId = useCallback(() => otherUserIdRef.current, []);

  useEffect(() => {
    // Nhận offer từ người gọi → lưu thông tin và chuyển sang trạng thái RECEIVING
    const handleOffer = ({
      callerId,
      offer,
      conversationId: incomingConvId,
      callerName: name,
    }: OfferPayload) => {
      otherUserIdRef.current = callerId;
      setIncomingCallFrom(callerId);
      setIncomingConversationId(incomingConvId);
      // Lưu tên người gọi từ payload để hiển thị trên overlay
      setCallerName(name ?? null);
      setCallStatus(CallStatus.RECEIVING);
      pendingOfferRef.current = { callerId, offer };
    };

    // Nhận answer từ người được gọi → hoàn tất quá trình handshake SDP
    const handleAnswer = async ({ answer }: AnswerPayload) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
    };

    // Nhận ICE candidate từ đối phương → add vào pc hoặc queue nếu chưa sẵn sàng
    const handleIce = async ({ candidate }: IceCandidatePayload) => {
      if (pcRef.current && pcRef.current.remoteDescription) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        // Remote description chưa set → queue lại, sẽ flush trong acceptCall
        pendingCandidates.current.push(candidate);
      }
    };

    // Đối phương chủ động kết thúc cuộc gọi
    const handleEnd = () => cleanup(CallEndReason.ENDED);

    // Đối phương từ chối cuộc gọi
    const handleReject = () => cleanup(CallEndReason.REJECTED);

    socket.on("call:offer", handleOffer);
    socket.on("call:answer", handleAnswer);
    socket.on("call:ice-candidate", handleIce);
    socket.on("call:end", handleEnd);
    socket.on("call:reject", handleReject);

    return () => {
      socket.off("call:offer", handleOffer);
      socket.off("call:answer", handleAnswer);
      socket.off("call:ice-candidate", handleIce);
      socket.off("call:end", handleEnd);
      socket.off("call:reject", handleReject);
    };
  }, [socket, cleanup]);

  return {
    callStatus,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    incomingCallFrom,
    incomingConversationId,
    callerName,
    endReason,
    getOtherUserId,
    startCall,
    acceptCall,
    toggleMute,
    toggleCamera,
    endCall,
    rejectCall,
  };
}
