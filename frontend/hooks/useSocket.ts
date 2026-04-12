"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

export const useSocket = (userId?: number) => {
  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    socket.connect();

    socket.emit("user:join", userId);

    return () => {
      socket.disconnect();
    };
  }, [userId]);
};
