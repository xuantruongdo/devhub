"use client";

import { useEffect, useState } from "react";
import { toastError } from "@/lib/toast";
import { useAppDispatch } from "@/redux/hooks";
import authService from "@/services/auth";
import { setCurrentUser } from "@/redux/reducers/currentUser";
import LoadingPage from "@/components/LoadingPage";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const fetchInitData = async () => {
    try {
      const { data: user } = await authService.current();
      dispatch(setCurrentUser(user));
      setLoading(false);
    } catch (error) {
      toastError(error);
      router.push("/login");
    }
  };

  useEffect(() => {
    fetchInitData();
  }, [dispatch]);

  if (loading) return <LoadingPage />;

  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default AuthenticatedLayout;
