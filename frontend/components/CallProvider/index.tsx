"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getSocket } from "@/lib/socket";
import { useWebRTC } from "@/hooks/useWebRTC";
import { CallContext } from "@/contexts/CallContext";
import IncomingCallOverlay from "../IncomingCallOverlay";
import chatService from "@/services/chat";
import { MessageType } from "@/constants";
import { addMessage, updateMessage } from "@/redux/reducers/message";
import { isMe } from "@/lib/utils";

export default function CallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useAppSelector((state) => state.currentUser);
  const selectedConversation = useAppSelector((state) => state.conversation);
  const socket = getSocket();
  const dispatch = useAppDispatch();

  const webRTC = useWebRTC({
    socket,
    currentUserId: currentUser.id,
    conversationId: selectedConversation?.id ?? 0,
    onSaveCallMessage: async ({
      conversationId,
      callDuration,
      callStatus,
      callerId,
    }) => {
      try {
        const { data } = await chatService.sendMessage({
          conversationId,
          type: MessageType.CALL,
          callDuration,
          callStatus,
          callerId,
        });

        console.log("===data", data);

        dispatch(addMessage(data));
      } catch (err) {
        console.error("Failed to save call message:", err);
      }
    },
  });

  return (
    <CallContext.Provider value={webRTC}>
      {children}
      <IncomingCallOverlay />
    </CallContext.Provider>
  );
}
