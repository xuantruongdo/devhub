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
          <div className="flex flex-col items-center gap-5 py-6 text-center text-foreground">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Phone className="w-7 h-7 text-primary" />
            </div>

            <div>
              <p className="font-semibold text-base text-foreground">
                {callerName || t("chat.call.calling.title")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("chat.call.calling.waiting")}
              </p>
            </div>

            <button
              onClick={onEnd}
              className="w-14 h-14 rounded-full bg-destructive hover:opacity-90 flex items-center justify-center shadow-md transition"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </div>
        );

      case CallStatus.RECEIVING:
        return (
          <div className="flex flex-col items-center gap-5 py-6 text-center text-foreground">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
              <Video className="w-7 h-7 text-primary" />
            </div>

            <div>
              <p className="font-semibold text-base text-foreground">
                {callerName || t("chat.call.receiving.title")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("chat.call.receiving.description")}
              </p>
            </div>

            <div className="flex gap-6 mt-2">
              <button
                onClick={onReject}
                className="w-12 h-12 rounded-full bg-destructive hover:opacity-90 flex items-center justify-center shadow transition"
              >
                <PhoneOff className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={onAccept}
                className="w-12 h-12 rounded-full bg-primary hover:opacity-90 flex items-center justify-center shadow transition"
              >
                <Phone className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>
          </div>
        );

      case CallStatus.CONNECTED:
        return (
          <div className="relative w-full h-full bg-background text-foreground">
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-4 py-2 bg-background/70 backdrop-blur border-b border-border text-sm text-foreground">
              <span className="font-medium">
                {callerName || t("chat.call.connected.title")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("chat.call.connected.status")}
              </span>
            </div>

            <div className="relative bg-black/90 aspect-video">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  {t("chat.call.connected.connecting")}
                </div>
              )}

              <div className="absolute bottom-4 right-4 w-32 h-24 rounded-xl overflow-hidden border border-border shadow-lg bg-black/70">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: "scaleX(-1)" }}
                />

                {isCameraOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <VideoOff className="w-5 h-5 text-white/80" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center items-center gap-6 py-5 bg-background border-t border-border">
              <button
                onClick={onToggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow transition ${
                  isMuted
                    ? "bg-destructive hover:opacity-90"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-foreground" />
                )}
              </button>

              {/* End call */}
              <button
                onClick={onEnd}
                className="w-14 h-14 rounded-full bg-destructive hover:opacity-90 flex items-center justify-center shadow-lg transition"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={onToggleCamera}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow transition ${
                  isCameraOff
                    ? "bg-destructive hover:opacity-90"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {isCameraOff ? (
                  <VideoOff className="w-5 h-5 text-white" />
                ) : (
                  <Video className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
          </div>
        );

      case CallStatus.ENDED:
        return (
          <div className="flex flex-col items-center gap-4 py-6 text-center text-foreground">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <PhoneOff className="w-6 h-6 text-destructive" />
            </div>

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
      className={`py-[20px] w-full ${
        callStatus === CallStatus.CONNECTED
          ? "sm:max-w-6xl overflow-hidden"
          : "sm:max-w-md text-center"
      }`}
      contentClassName="max-h-none"
    >
      {renderContent()}
    </CustomDialog>
  );
}
