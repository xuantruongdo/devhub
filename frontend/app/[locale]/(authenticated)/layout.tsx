"use client";

import { useEffect, useState } from "react";
import { toastError } from "@/lib/toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import authService from "@/services/auth";
import { setCurrentUser } from "@/redux/reducers/currentUser";
import LoadingPage from "@/components/LoadingPage";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { getSocket } from "@/lib/socket";
import CallProvider from "@/components/CallProvider";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

const AuthenticatedLayout = ({ children, modal }: AuthenticatedLayoutProps) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const currentUser = useAppSelector((state) => state.currentUser);

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const { data: user } = await authService.current();
        dispatch(setCurrentUser(user));

        const socket = getSocket();

        if (!socket.connected) {
          socket.connect();
        }
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

  useSocket(currentUser?.id ?? 0);

  if (loading) return <LoadingPage />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CallProvider>
        <div className="flex-1 overflow-hidden">{children}</div>
        {modal}
      </CallProvider>
    </div>
  );
};

export default AuthenticatedLayout;
