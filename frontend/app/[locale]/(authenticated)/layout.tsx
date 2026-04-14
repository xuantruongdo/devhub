"use client";

import { useEffect, useState } from "react";
import { toastError } from "@/lib/toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import authService from "@/services/auth";
import { setCurrentUser } from "@/redux/reducers/currentUser";
import LoadingPage from "@/components/LoadingPage";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

import { useVideoCall } from "@/hooks/useVideoCall";
import { VideoCallOverlay } from "@/components/Chat/VideoCallOverlay";
import { VideoCallProvider } from "@/contexts/VideoCallContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { useSocketContext } from "@/contexts/SocketContext";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

function InnerLayout({ children, modal }: AuthenticatedLayoutProps) {
  const currentUser = useAppSelector((state) => state.currentUser);

  const { socket } = useSocketContext();

  const videoCall = useVideoCall({
    socket,
    currentUserId: currentUser?.id,
    currentUserFullName: currentUser?.fullName,
    currentUserAvatar: currentUser?.avatar,
  });

  const {
    callState,
    isMuted,
    isCameraOff,
    remoteName,
    remoteAvatar,
    localVideoRef,
    remoteVideoRef,
    acceptCall,
    rejectCall,
    endCall,
    cancelCall,
    toggleMute,
    toggleCamera,
  } = videoCall;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <VideoCallProvider value={videoCall}>
        <div className="flex-1 overflow-hidden">{children}</div>
        {modal}
      </VideoCallProvider>

      <VideoCallOverlay
        callState={callState}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        remoteName={remoteName}
        remoteAvatar={remoteAvatar}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEnd={endCall}
        onCancel={cancelCall}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
      />
    </div>
  );
}

export default function AuthenticatedLayout({
  children,
  modal,
}: AuthenticatedLayoutProps) {
  const [loading, setLoading] = useState(true);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const currentUser = useAppSelector((state) => state.currentUser);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const { data } = await authService.current();
        dispatch(setCurrentUser(data));
        setLoading(false);
      } catch (error) {
        toastError(error);
        router.push("/login");
      }
    };

    fetchInitData();
  }, [dispatch, router]);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  if (loading || !currentUser?.id) return <LoadingPage />;

  return (
    <SocketProvider userId={currentUser.id}>
      <InnerLayout modal={modal}>{children}</InnerLayout>
    </SocketProvider>
  );
}
