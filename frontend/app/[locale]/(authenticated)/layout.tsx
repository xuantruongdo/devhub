"use client";

import { useEffect, useState } from "react";
import { toastError } from "@/lib/toast";
import { useAppDispatch } from "@/redux/hooks";
import authService from "@/services/auth";
import { setCurrentUser } from "@/redux/reducers/currentUser";
import LoadingPage from "@/components/LoadingPage";
import Header from "@/components/Header";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  const fetchInitData = async () => {
    try {
      const { data: user } = await authService.current();
      dispatch(setCurrentUser(user));
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitData();
  }, [dispatch]);

  return (
    <LoadingPage loading={loading}>
      <Header />
      {children}
    </LoadingPage>
  );
};

export default AuthenticatedLayout;
