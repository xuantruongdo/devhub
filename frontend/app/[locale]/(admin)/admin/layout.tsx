"use client";

import { HeaderAdmin } from "@/components/Admin/HeaderAdmin";
import { SidebarAdmin } from "@/components/Admin/SidebarAdmin";
import Forbidden from "@/components/Forbidden";
import LoadingPage from "@/components/LoadingPage";
import { UserRole } from "@/constants";
import { useModal } from "@/hooks/useModal";
import { useTranslation } from "@/hooks/useTranslation";
import { toastError } from "@/lib/toast";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setCurrentUser } from "@/redux/reducers/currentUser";
import authService from "@/services/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, toggleModal } = useModal();
  const [loading, setLoading] = useState(true);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t, locale, ready } = useTranslation();
  const currentUser = useAppSelector((state) => state.currentUser);

  useEffect(() => {
    const fetchInitData = async () => {
      if (!ready) return;
      try {
        const { data } = await authService.current();
        dispatch(setCurrentUser(data));
        setLoading(false);
      } catch {
        toastError(t("auth.login.errors.loginRequired"));
        router.push(`/${locale}/login`);
      }
    };

    fetchInitData();
  }, [dispatch, router, ready]);

  if (loading || !currentUser.id) return <LoadingPage />;

  if (currentUser.role !== UserRole.ADMIN) return <Forbidden />;

  return (
    <div className="flex h-screen bg-background">
      <SidebarAdmin isOpen={isOpen} setIsOpen={toggleModal} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderAdmin onToggleSidebar={toggleModal} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
