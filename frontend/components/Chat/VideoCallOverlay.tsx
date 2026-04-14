"use client";

import Image from "next/image";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { CallState } from "@/constants";
import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/utils";

export interface VideoCallOverlayProps {
  callState: CallState;
  isMuted: boolean;
  isCameraOff: boolean;
  remoteName: string | null;
  remoteAvatar: string | null;

  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;

  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onCancel: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export function VideoCallOverlay(props: VideoCallOverlayProps) {
  const { t } = useTranslation();

  const {
    callState,
    isMuted,
    isCameraOff,
    remoteName,
    remoteAvatar,
    localVideoRef,
    remoteVideoRef,
    onAccept,
    onReject,
    onEnd,
    onCancel,
    onToggleMute,
    onToggleCamera,
  } = props;

  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [isRemoteCameraOff, setIsRemoteCameraOff] = useState(false);

  useEffect(() => {
    if (callState !== CallState.CONNECTED) {
      setIsRemoteMuted(false);
      setIsRemoteCameraOff(false);
      return;
    }

    const videoEl = remoteVideoRef.current;
    if (!videoEl) return;

    const readTrackStates = () => {
      const stream = videoEl.srcObject as MediaStream | null;
      if (!stream) return;

      const audioTracks = stream.getAudioTracks();
      const videoTracks = stream.getVideoTracks();

      setIsRemoteMuted(
        audioTracks.length === 0 || audioTracks.every((t) => !t.enabled),
      );
      setIsRemoteCameraOff(
        videoTracks.length === 0 || videoTracks.every((t) => !t.enabled),
      );
    };

    const subscribeToStream = (stream: MediaStream | null) => {
      if (!stream) return () => {};

      readTrackStates();

      const handleChange = () => readTrackStates();

      stream.getTracks().forEach((track) => {
        track.addEventListener("mute", handleChange);
        track.addEventListener("unmute", handleChange);
        track.addEventListener("ended", handleChange);
      });

      stream.addEventListener("addtrack", () => {
        readTrackStates();
        stream.getTracks().forEach((track) => {
          track.addEventListener("mute", handleChange);
          track.addEventListener("unmute", handleChange);
          track.addEventListener("ended", handleChange);
        });
      });

      stream.addEventListener("removetrack", handleChange);

      return () => {
        stream.getTracks().forEach((track) => {
          track.removeEventListener("mute", handleChange);
          track.removeEventListener("unmute", handleChange);
          track.removeEventListener("ended", handleChange);
        });
      };
    };

    let cleanup = subscribeToStream(videoEl.srcObject as MediaStream | null);

    const pollInterval = setInterval(() => {
      const stream = videoEl.srcObject as MediaStream | null;
      if (stream) readTrackStates();
    }, 1500);

    return () => {
      cleanup();
      clearInterval(pollInterval);
    };
  }, [callState, remoteVideoRef]);

  useEffect(() => {
    if (callState !== CallState.CONNECTED) {
      setDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callState]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/ringtone_call.mp3");
      audioRef.current.loop = true;
    }

    if (callState === CallState.INCOMING) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    return () => {
      audioRef.current?.pause();
      audioRef.current && (audioRef.current.currentTime = 0);
    };
  }, [callState]);

  if (callState === CallState.IDLE) return null;

  const renderAvatar = () => {
    if (remoteAvatar) {
      return (
        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border border-white/20">
          <Image
            src={remoteAvatar}
            alt={remoteName || "avatar"}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
      );
    }

    return (
      <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto">
        <Video className="w-9 h-9 text-white" />
      </div>
    );
  };

  const renderContent = () => {
    switch (callState) {
      case CallState.CALLING:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <div className="text-center">
              {renderAvatar()}

              <p className="text-white mt-3 text-xl font-medium">
                {remoteName}
              </p>
              <p className="text-white/60 text-sm animate-pulse">
                {t("chat.call.calling.title")}
              </p>
            </div>

            <button
              onClick={onCancel}
              className="bg-red-500 hover:bg-red-600 rounded-full p-5"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>
          </div>
        );

      case CallState.INCOMING:
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8 bg-zinc-900/90">
            <div className="text-center">
              {renderAvatar()}

              <p className="text-white mt-3 text-xl font-medium">
                {remoteName}
              </p>
              <p className="text-white/60 text-sm">
                {t("chat.call.receiving.title")}
              </p>
            </div>

            <div className="flex gap-16">
              <button
                onClick={onReject}
                className="bg-red-500 hover:bg-red-600 rounded-full p-5"
              >
                <PhoneOff className="w-8 h-8 text-white" />
              </button>

              <button
                onClick={onAccept}
                className="bg-green-500 hover:bg-green-600 rounded-full p-5"
              >
                <Phone className="w-8 h-8 text-white" />
              </button>
            </div>
          </div>
        );

      case CallState.CONNECTED:
        return (
          <>
            <div className="absolute top-4 left-0 right-0 text-center text-white z-[2]">
              <p className="font-medium">{remoteName}</p>
              <p className="text-sm text-white/70 mt-1">
                {formatDuration(duration)}
              </p>

              {(isRemoteMuted || isRemoteCameraOff) && (
                <div className="flex items-center justify-center gap-2 mt-2 flex-wrap px-4">
                  {isRemoteMuted && (
                    <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <MicOff className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-red-300">
                        {remoteName} đã tắt mic
                      </span>
                    </span>
                  )}
                  {isRemoteCameraOff && (
                    <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <VideoOff className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-red-300">
                        {remoteName} đã tắt camera
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>

            {isRemoteCameraOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/85 z-[1]">
                {renderAvatar()}
                <p className="text-white/50 text-sm mt-3">Camera đã tắt</p>
              </div>
            )}

            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-5 z-[2]">
              <button
                onClick={onToggleMute}
                className="bg-white/10 p-5 rounded-full cursor-pointer transition-all duration-200 hover:bg-white/20 hover:scale-110 active:scale-95"
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={onEnd}
                className="bg-red-500 p-5 rounded-full cursor-pointer transition-all duration-200 hover:bg-red-600 hover:scale-110 active:scale-95"
              >
                <PhoneOff className="w-7 h-7 text-white" />
              </button>

              <button
                onClick={onToggleCamera}
                className="bg-white/10 p-5 rounded-full cursor-pointer transition-all duration-200 hover:bg-white/20 hover:scale-110 active:scale-95"
              >
                {isCameraOff ? (
                  <VideoOff className="w-6 h-6 text-white" />
                ) : (
                  <Video className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const showLocalCam = callState !== CallState.INCOMING;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900 flex flex-col select-none">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {showLocalCam && (
        <div className="absolute top-4 right-4 w-28 h-40 md:w-36 md:h-52 rounded-2xl overflow-hidden border border-white/20 shadow-xl z-10">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {isCameraOff && (
            <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
              <VideoOff className="w-6 h-6 text-zinc-400" />
            </div>
          )}
        </div>
      )}

      {renderContent()}
    </div>
  );
}
