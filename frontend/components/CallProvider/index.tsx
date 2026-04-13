"use client";

import { useAppSelector } from "@/redux/hooks";
import { getSocket } from "@/lib/socket";
import { useWebRTC } from "@/hooks/useWebRTC";
import { CallContext } from "@/contexts/CallContext";
import IncomingCallOverlay from "../IncomingCallOverlay";

export default function CallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useAppSelector((state) => state.currentUser);
  const selectedConversation = useAppSelector((state) => state.conversation);
  const socket = getSocket();

  const webRTC = useWebRTC({
    socket,
    currentUserId: currentUser.id,
    conversationId: selectedConversation?.id ?? 0,
  });

  return (
    <CallContext.Provider value={webRTC}>
      {children}
      <IncomingCallOverlay />
    </CallContext.Provider>
  );
}
