"use client";

import { useCallContext } from "@/contexts/CallContext";
import VideoCallDialog from "../Chat/VideoCallDialog";

export default function IncomingCallOverlay() {
  const {
    callStatus,
    incomingCallFrom,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    callerId,
    callerName,
    endReason,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    getOtherUserId,
  } = useCallContext();

  const handleEnd = () => {
    const targetId = getOtherUserId();
    if (targetId) endCall(targetId, callerId!);
  };

  return (
    <VideoCallDialog
      callStatus={callStatus}
      localStream={localStream}
      remoteStream={remoteStream}
      isMuted={isMuted}
      isCameraOff={isCameraOff}
      callerName={callerName}
      endReason={endReason}
      onAccept={acceptCall}
      onReject={() =>
        incomingCallFrom && callerId && rejectCall(incomingCallFrom, callerId)
      }
      onEnd={handleEnd}
      onToggleMute={toggleMute}
      onToggleCamera={toggleCamera}
    />
  );
}
