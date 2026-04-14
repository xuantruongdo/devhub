"use client";

import { createContext, useContext } from "react";
import { useVideoCall } from "@/hooks/useVideoCall";

type VideoCallContextType = ReturnType<typeof useVideoCall>;

const VideoCallContext = createContext<VideoCallContextType | null>(null);

export const VideoCallProvider = VideoCallContext.Provider;

export function useVideoCallContext() {
  const ctx = useContext(VideoCallContext);
  if (!ctx)
    throw new Error(
      "useVideoCallContext must be used within VideoCallProvider",
    );
  return ctx;
}
