import {
  CallEndReason,
  CallState,
  MessageType,
  TIMEOUT_RING,
} from "@/constants";
import chatService from "@/services/chat";
import {
  CallAnsweredPayload,
  IceCandidatePayload,
  IncomingCallPayload,
} from "@/types/webrtc";
import { useCallback, useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { Socket } from "socket.io-client";

type SignalData = SimplePeer.SignalData;

interface UseVideoCallOptions {
  socket: Socket;
  /** ID của người dùng hiện tại (người đang dùng app) */
  currentUserId: number;
  /** Tên hiển thị của người dùng hiện tại — gửi cho phía nhận */
  currentUserFullName: string;
  /** Avatar của người dùng hiện tại — gửi cho phía nhận */
  currentUserAvatar: string;
}

export function useVideoCall({
  socket,
  currentUserId,
  currentUserFullName,
  currentUserAvatar,
}: UseVideoCallOptions) {
  // ── Trạng thái cuộc gọi ──────────────────────────────────
  /** Trạng thái hiện tại: idle | calling | incoming | connected */
  const [callState, setCallState] = useState<CallState>(CallState.IDLE);

  /** ID của người dùng ở đầu dây bên kia */
  const [remoteUserId, setRemoteUserId] = useState<number | null>(null);

  /** SDP offer nhận được khi có cuộc gọi đến — dùng để signal peer */
  const [incomingOffer, setIncomingOffer] = useState<SignalData | null>(null);

  /** Micro có đang tắt không */
  const [isMuted, setIsMuted] = useState(false);

  /** Camera có đang tắt không */
  const [isCameraOff, setIsCameraOff] = useState(false);

  /** Tên của người đang gọi đến (nhận từ payload socket) */
  const [remoteName, setRemoteName] = useState<string | null>(null);

  /** Avatar của người đang gọi đến (nhận từ payload socket) */
  const [remoteAvatar, setRemoteAvatar] = useState<string | null>(null);

  // ── Media & WebRTC refs ──────────────────────────────────
  /** Stream video/audio từ camera & mic của người dùng hiện tại */
  const localStreamRef = useRef<MediaStream | null>(null);

  /** Instance SimplePeer — đại diện cho kết nối WebRTC */
  const peerRef = useRef<SimplePeer.Instance | null>(null);

  /** Thẻ <video> hiển thị camera của chính mình */
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  /** Thẻ <video> hiển thị stream từ người kia */
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // ── Timer refs ───────────────────────────────────────────
  /** Thời lượng cuộc gọi tính bằng giây (đếm khi connected) */
  const callDurationRef = useRef(0);

  /** Interval tăng callDurationRef mỗi giây */
  const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Timeout tự động từ chối nếu người nhận không bắt máy */
  const autoRejectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Conversation refs (giữ giá trị ổn định cho async callbacks) ──
  /** ID của người khởi tạo cuộc gọi */
  const callerIdRef = useRef<number | null>(null);

  /** ID của người ở đầu bên kia (to) */
  const remoteUserIdRef = useRef<number | null>(null);

  /** ID của cuộc hội thoại — cần để lưu message sau khi kết thúc */
  const conversationIdRef = useRef<number | null>(null);

  /**
   * Mirror của callState dưới dạng ref.
   * Socket listeners đọc ref này thay vì đọc callState qua closure,
   * tránh tình trạng handler bắt event với state cũ (stale closure).
   */
  const callStateRef = useRef<CallState>(CallState.IDLE);

  /**
   * Buffer các ICE candidate đến trước khi peer được khởi tạo.
   * Xảy ra thường xuyên trên mạng mobile (4G/5G): initiator gửi
   * candidate rất nhanh, đến nơi trước khi người nhận bấm Accept
   * và peerRef.current được tạo → signal() gọi trên null → bị drop.
   */
  const iceCandidateQueue = useRef<SignalData[]>([]);

  /**
   * Dùng hàm này thay cho setCallState trực tiếp ở mọi nơi trong hook.
   * Đảm bảo callStateRef.current luôn khớp với React state.
   */
  const updateCallState = useCallback((state: CallState) => {
    callStateRef.current = state;
    setCallState(state);
  }, []);

  // ─────────────────────────────────────────────────────────
  // TIMER HELPERS
  // ─────────────────────────────────────────────────────────

  /** Bắt đầu đếm thời lượng cuộc gọi từ 0 */
  const startDurationTimer = useCallback(() => {
    callDurationRef.current = 0;
    durationTimerRef.current = setInterval(() => {
      callDurationRef.current += 1;
    }, 1000);
  }, []);

  /** Dừng và huỷ interval đếm thời lượng */
  const stopDurationTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  /** Huỷ timeout tự động từ chối cuộc gọi */
  const clearAutoRejectTimer = useCallback(() => {
    if (autoRejectTimerRef.current) {
      clearTimeout(autoRejectTimerRef.current);
      autoRejectTimerRef.current = null;
    }
  }, []);

  /**
   * Dọn dẹp toàn bộ trạng thái sau khi cuộc gọi kết thúc
   * (dù là kết thúc bình thường, từ chối, huỷ, hay lỗi)
   */
  const cleanup = useCallback(() => {
    clearAutoRejectTimer();

    // Huỷ kết nối WebRTC
    peerRef.current?.destroy();
    peerRef.current = null;

    // Tắt camera & mic
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;

    // Xoá srcObject của cả hai thẻ video
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    // Reset timer
    stopDurationTimer();
    callDurationRef.current = 0;

    // Reset refs
    callerIdRef.current = null;
    remoteUserIdRef.current = null;
    conversationIdRef.current = null;

    iceCandidateQueue.current = [];

    // Reset state
    updateCallState(CallState.IDLE);
    setRemoteUserId(null);
    setIncomingOffer(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setRemoteName(null);
    setRemoteAvatar(null);
  }, [clearAutoRejectTimer, stopDurationTimer, updateCallState]);

  /**
   * Yêu cầu quyền truy cập camera & mic, lưu stream vào ref
   * và gắn vào thẻ <video> local nếu đã mount
   */
  const getLocalStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = stream;

    setTimeout(() => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    }, 100);

    return stream;
  }, []);

  /**
   * Đăng ký các event handler cho một SimplePeer instance:
   * - stream: gắn stream từ xa vào thẻ video remote
   * - connect: chuyển sang trạng thái connected, bắt đầu đếm giờ
   * - close / error: dọn dẹp
   */
  const setupPeerEvents = useCallback(
    (peer: SimplePeer.Instance) => {
      peer.on("stream", (stream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      });

      peer.on("connect", () => {
        updateCallState(CallState.CONNECTED);
        startDurationTimer();
      });

      peer.on("close", cleanup);
      peer.on("error", cleanup);
    },
    [cleanup, startDurationTimer, updateCallState],
  );

  // AUTO REJECT (khi người nhận không bắt máy)
  useEffect(() => {
    if (callState !== CallState.INCOMING) return;

    clearAutoRejectTimer();

    autoRejectTimerRef.current = setTimeout(async () => {
      const callerId = callerIdRef.current;
      const toUserId = remoteUserIdRef.current;

      if (toUserId) {
        socket.emit("call:reject", { to: toUserId, from: currentUserId });
      }

      if (callerId) {
        await chatService.sendMessage({
          conversationId: conversationIdRef.current ?? 0,
          type: MessageType.CALL,
          callStatus: CallEndReason.TIMEOUT,
          callerId,
        });
      }

      cleanup();
    }, TIMEOUT_RING);

    return clearAutoRejectTimer;
  }, [callState, socket, currentUserId, cleanup, clearAutoRejectTimer]);

  // SOCKET LISTENERS
  useEffect(() => {
    /** Nhận cuộc gọi đến từ người khác */
    const handleIncomingCall = ({
      from,
      offer,
      conversationId,
      callerName,
      callerAvatar,
    }: IncomingCallPayload) => {
      if (callStateRef.current !== CallState.IDLE) return;

      callerIdRef.current = from;
      remoteUserIdRef.current = from;
      conversationIdRef.current = conversationId;

      setRemoteUserId(from);
      setIncomingOffer(offer);
      setRemoteName(callerName);
      setRemoteAvatar(callerAvatar);
      updateCallState(CallState.INCOMING);
    };

    /** Nhận answer SDP từ người được gọi — hoàn tất handshake */
    const handleCallAnswered = ({ answer }: CallAnsweredPayload) => {
      peerRef.current?.signal(answer);
    };

    /** Nhận ICE candidate từ phía bên kia — dùng để duy trì kết nối */
    const handleIceCandidate = ({ candidate }: IceCandidatePayload) => {
      if (peerRef.current) {
        peerRef.current.signal(candidate);
      } else {
        iceCandidateQueue.current.push(candidate);
      }
    };

    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:answered", handleCallAnswered);
    socket.on("call:ice-candidate", handleIceCandidate);
    socket.on("call:ended", cleanup);
    socket.on("call:rejected", cleanup);
    socket.on("call:cancelled", cleanup);

    return () => {
      socket.off("call:incoming", handleIncomingCall);
      socket.off("call:answered", handleCallAnswered);
      socket.off("call:ice-candidate", handleIceCandidate);
      socket.off("call:ended", cleanup);
      socket.off("call:rejected", cleanup);
      socket.off("call:cancelled", cleanup);
    };
  }, [socket, cleanup, updateCallState]);

  /**
   * Bắt đầu cuộc gọi đến người dùng khác:
   * 1. Lấy stream local
   * 2. Tạo peer với vai trò initiator
   * 3. Gửi offer + ICE candidates qua socket
   */
  const startCall = useCallback(
    async (toUserId: number, conversationId: number) => {
      try {
        // Lấy camera + mic của user hiện tại
        // → trả về MediaStream (video + audio)
        const stream = await getLocalStream();

        // Tạo WebRTC peer (người gọi - initiator)
        // initiator: true = bạn là người BẮT ĐẦU cuộc gọi
        const peer = new SimplePeer({
          initiator: true,

          // gắn camera + mic vào WebRTC để gửi sang người kia
          stream,

          // bật trickle ICE:
          // → gửi ICE candidate ngay khi tìm thấy (không đợi gom hết)
          trickle: true,

          // cấu hình server hỗ trợ tìm đường mạng
          config: {
            iceServers: [
              // STUN server: giúp tìm IP public của bạn
              { urls: "stun:stun.l.google.com:19302" },

              // STUN backup server (dự phòng)
              { urls: "stun:stun1.l.google.com:19302" },

              // TURN server (chưa dùng)
              // → dùng khi không thể kết nối P2P trực tiếp
            ],
          },
        });

        // lưu peer vào ref để dùng ở các hàm khác (endCall, acceptCall...)
        peerRef.current = peer;

        // xử lý dữ liệu WebRTC phát sinh (signal event)
        // → SimplePeer sẽ tự tạo:
        //    - offer (SDP)
        //    - ICE candidate
        peer.on("signal", (data: SignalData) => {
          // TRƯỜNG HỢP 1: OFFER (SDP ban đầu)
          // → dùng để bắt đầu cuộc gọi
          if ("type" in data && data.type === "offer") {
            socket.emit("call:offer", {
              to: toUserId, // người nhận
              from: currentUserId, // người gọi
              offer: data, // SDP offer
              conversationId, // id cuộc chat
              callerName: currentUserFullName, // tên người gọi
              callerAvatar: currentUserAvatar, // avatar người gọi
            });
          }

          // TRƯỜNG HỢP 2: ICE CANDIDATE
          // → các đường mạng để 2 máy tìm nhau
          else {
            // Cả 2 bên liên tục gửi ICE -> Kết nối thành công
            socket.emit("call:ice-candidate", {
              to: toUserId,
              from: currentUserId,
              candidate: data, // thông tin IP/port/route
            });
          }
        });

        // gắn event lifecycle cho peer
        // → stream: nhận video người kia
        // → connect: kết nối thành công
        // → close/error: cleanup
        setupPeerEvents(peer);

        // lưu metadata cuộc gọi
        // → dùng cho reject / end / save message
        callerIdRef.current = currentUserId;
        remoteUserIdRef.current = toUserId;
        conversationIdRef.current = conversationId;

        // → trạng thái: đang gọi (CALLING)
        setRemoteUserId(toUserId);
        updateCallState(CallState.CALLING);
      } catch (error) {
        console.error("[useVideoCall] startCall error:", error);
        cleanup();
      }
    },
    [
      socket,
      currentUserId,
      currentUserFullName,
      currentUserAvatar,
      getLocalStream,
      setupPeerEvents,
      cleanup,
      updateCallState,
    ],
  );

  /**
   * Chấp nhận cuộc gọi đến:
   * 1. Lấy stream local
   * 2. Tạo peer với vai trò receiver
   * 3. Signal offer đã nhận trước đó
   */
  const acceptCall = useCallback(async () => {
    clearAutoRejectTimer();

    if (!incomingOffer || !remoteUserIdRef.current) return;

    try {
      const stream = await getLocalStream();

      // Tạo peer TRƯỚC khi signal offer
      const peer = new SimplePeer({
        initiator: false,
        stream,
        trickle: true,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            // Thêm TURN server nếu có:
            // {
            //   urls: "turn:your-turn-server.com:3478",
            //   username: "user",
            //   credential: "pass",
            // },
          ],
        },
      });

      // Đăng ký events TRƯỚC khi signal bất kỳ thứ gì
      setupPeerEvents(peer);

      peer.on("signal", (data: SignalData) => {
        const to = remoteUserIdRef.current;
        if (!to) return;

        if ("type" in data && data.type === "answer") {
          socket.emit("call:answer", { to, from: currentUserId, answer: data });
        } else {
          // Cả 2 bên liên tục gửi ICE -> Kết nối thành công
          socket.emit("call:ice-candidate", {
            to,
            from: currentUserId,
            candidate: data,
          });
        }
      });

      // Gán ref TRƯỚC khi signal để handleIceCandidate không queue thêm
      peerRef.current = peer;

      // Lấy ra tất cả ICE candidate (các “đường mạng”) đã đến sớm và đang bị tạm giữ
      // (vì lúc này peer chưa sẵn sàng nên chưa xử lý được)
      const queued = iceCandidateQueue.current.splice(0);

      // Bước 1: xử lý OFFER trước
      // → nhận “lời mời cuộc gọi” từ bên kia
      // → giúp peer biết đây là cuộc gọi nào và thiết lập phiên kết nối ban đầu
      peer.signal(incomingOffer);

      // Bước 2: sau khi đã nhận offer xong
      // → peer lúc này đã sẵn sàng
      // → đem các ICE candidate đã lưu trước đó ra xử lý lại
      queued.forEach((c) => peer.signal(c));

      updateCallState(CallState.CALLING);
    } catch (error) {
      console.error("[useVideoCall] acceptCall error:", error);
      cleanup();
    }
  }, [
    socket,
    currentUserId,
    incomingOffer,
    getLocalStream,
    setupPeerEvents,
    clearAutoRejectTimer,
    updateCallState,
    cleanup,
  ]);

  /**
   * Từ chối cuộc gọi đến:
   * - Emit socket để báo phía gọi
   * - Lưu message với status REJECTED
   */
  const rejectCall = useCallback(async () => {
    const conversationId = conversationIdRef.current;
    if (!conversationId) return;

    clearAutoRejectTimer();

    const callerId = callerIdRef.current;
    const toUserId = remoteUserIdRef.current;

    cleanup();

    if (toUserId) {
      socket.emit("call:reject", { to: toUserId, from: currentUserId });
    }

    if (callerId) {
      chatService
        .sendMessage({
          conversationId,
          type: MessageType.CALL,
          callStatus: CallEndReason.REJECTED,
          callerId,
        })
        .catch(console.error);
    }
  }, [socket, currentUserId, cleanup, clearAutoRejectTimer]);

  /**
   * Kết thúc cuộc gọi đang diễn ra:
   * - Emit socket để báo phía kia
   * - Lưu message với status ENDED kèm thời lượng
   */
  const endCall = useCallback(() => {
    const conversationId = conversationIdRef.current;
    if (!conversationId) return;

    clearAutoRejectTimer();

    const duration = callDurationRef.current;
    const callerId = callerIdRef.current;
    const toUserId = remoteUserIdRef.current;

    cleanup();

    if (toUserId) {
      socket.emit("call:end", { to: toUserId, from: currentUserId });
    }

    if (callerId) {
      chatService
        .sendMessage({
          conversationId,
          type: MessageType.CALL,
          callDuration: duration,
          callStatus: CallEndReason.ENDED,
          callerId,
        })
        .catch(console.error);
    }
  }, [socket, currentUserId, cleanup, clearAutoRejectTimer]);

  /**
   * Huỷ cuộc gọi đang đổ chuông (chưa được bắt máy):
   * - Emit socket để báo phía nhận
   * - Lưu message với status TIMEOUT
   */
  const cancelCall = useCallback(() => {
    const conversationId = conversationIdRef.current;
    if (!conversationId) return;

    clearAutoRejectTimer();

    const callerId = callerIdRef.current;
    const toUserId = remoteUserIdRef.current;

    cleanup();

    if (toUserId) {
      socket.emit("call:cancel", { to: toUserId, from: currentUserId });
    }

    if (callerId) {
      chatService
        .sendMessage({
          conversationId,
          type: MessageType.CALL,
          callStatus: CallEndReason.TIMEOUT,
          callerId,
        })
        .catch(console.error);
    }
  }, [socket, currentUserId, cleanup, clearAutoRejectTimer]);

  /** Bật/tắt micro */
  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted((prev) => !prev);
  }, []);

  /** Bật/tắt camera */
  const toggleCamera = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsCameraOff((prev) => !prev);
  }, []);

  return {
    // State
    callState,
    remoteUserId,
    isMuted,
    isCameraOff,
    remoteName,
    remoteAvatar,

    // Refs gắn vào thẻ <video>
    localVideoRef,
    remoteVideoRef,

    // Actions
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    cancelCall,
    toggleMute,
    toggleCamera,
  };
}
