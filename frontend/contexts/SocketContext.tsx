"use client";

import { createSocket } from "@/lib/socket";
import { createContext, useContext, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: number;
}) => {
  const socket = createSocket();

  const joinedUserRef = useRef<number | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const handleConnect = () => {
      isConnectedRef.current = true;
    };

    const handleDisconnect = () => {
      isConnectedRef.current = false;
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (!userId) return;

    const joinUser = () => {
      if (joinedUserRef.current === userId) return;

      socket.emit("user:join", userId);
      joinedUserRef.current = userId;
    };

    if (socket.connected) {
      joinUser();
    }

    socket.on("connect", joinUser);

    return () => {
      socket.off("connect", joinUser);
    };
  }, [socket, userId]);

  useEffect(() => {
    joinedUserRef.current = null;
  }, [userId]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected: socket.connected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocketContext must be used within SocketProvider");
  }

  return context;
};
