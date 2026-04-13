"use client";

import { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone } from "lucide-react";
import { CustomDialog } from "@/components/ui/dialog";
import { CallEndReason, CallStatus } from "@/constants";
import { useTranslation } from "@/hooks/useTranslation";

interface VideoCallDialogProps {
  callStatus: CallStatus;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isCameraOff: boolean;
  callerName: string | null;
  endReason: CallEndReason | null;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export default function VideoCallDialog(props: VideoCallDialogProps) {
  const {
    callStatus,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    callerName,
    endReason,
    onAccept,
    onReject,
    onEnd,
    onToggleMute,
    onToggleCamera,
  } = props;
  const { t } = useTranslation();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(() => {});
    }
  }, [localStream]);

  // Remote video
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(() => {});
    }
  }, [remoteStream]);

  const renderContent = () => {
    switch (callStatus) {
      case CallStatus.CALLING:
        return (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
              <Phone className="w-7 h-7 text-blue-500" />
            </div>

            <div>
              <p className="font-semibold text-base">
                {callerName || t("chat.call.calling.title")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("chat.call.calling.waiting")}
              </p>
            </div>

            <button
              onClick={onEnd}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-md"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>
        );

      case CallStatus.RECEIVING:
        return (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
              <Video className="w-7 h-7 text-green-600" />
            </div>

            <div>
              <p className="font-semibold text-base">
                {callerName || t("chat.call.receiving.title")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("chat.call.receiving.description")}
              </p>
            </div>

            <div className="flex gap-6 mt-2">
              <button
                onClick={onReject}
                className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow"
              >
                <PhoneOff className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={onAccept}
                className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow"
              >
                <Phone className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        );

      case CallStatus.CONNECTED:
        return (
          <>
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-4 py-2 bg-black/40 text-white text-sm">
              <span className="font-medium">
                {callerName || t("chat.call.connected.title")}
              </span>
              <span className="text-xs opacity-70">
                {t("chat.call.connected.status")}
              </span>
            </div>

            <div className="relative bg-black aspect-video">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
                  {t("chat.call.connected.connecting")}
                </div>
              )}

              <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl overflow-hidden border border-white/20 shadow-lg bg-black">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />

                {isCameraOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <VideoOff className="w-5 h-5 text-white/70" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center items-center gap-6 py-5 bg-white">
              <button
                onClick={onToggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow ${
                  isMuted
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-gray-700" />
                )}
              </button>

              <button
                onClick={onEnd}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={onToggleCamera}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow ${
                  isCameraOff
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {isCameraOff ? (
                  <VideoOff className="w-5 h-5 text-white" />
                ) : (
                  <Video className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </>
        );

      case CallStatus.ENDED:
        return (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <PhoneOff className="w-10 h-10 text-red-500" />

            <p className="font-semibold text-base">
              {endReason === CallEndReason.REJECTED &&
                t("chat.call.ended.rejected")}
              {endReason === CallEndReason.TIMEOUT &&
                t("chat.call.ended.timeout")}
              {endReason === CallEndReason.ENDED && t("chat.call.ended.ended")}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // Chỉ mở dialog khi có call
  const isOpen = callStatus !== CallStatus.IDLE;

  return (
    <CustomDialog
      open={isOpen}
      title=""
      onCancel={() => {}}
      onConfirm={() => {}}
      hideCancelButton
      hideConfirmButton
      className={`${
        callStatus === CallStatus.CONNECTED
          ? "sm:max-w-3xl p-0 overflow-hidden"
          : "sm:max-w-xs text-center"
      }`}
      contentClassName="max-h-none"
    >
      {renderContent()}
    </CustomDialog>
  );
}
