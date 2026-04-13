"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import type { Socket } from "socket.io-client";

export const useSocket = (userId: number): Socket => {
  const socket = getSocket();

  useEffect(() => {
    if (!socket || !userId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("user:join", userId);
  }, [socket, userId]);

  return socket;
};
