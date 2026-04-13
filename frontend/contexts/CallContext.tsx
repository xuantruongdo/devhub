import { createContext, useContext } from "react";
import { useWebRTC } from "@/hooks/useWebRTC";

type CallContextValue = ReturnType<typeof useWebRTC>;

export const CallContext = createContext<CallContextValue | null>(null);

export function useCallContext() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCallContext must be used inside CallProvider");
  return ctx;
}
