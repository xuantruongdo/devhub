"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toastError } from "@/lib/toast";
import { useTranslation } from "@/hooks/useTranslation";
import Profile from "@/components/Profile";
import authService from "@/services/auth";

export default function ProfilePage() {
  const { slug } = useParams();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchPost = async () => {
      try {
        const { data } = await authService.findByUsername(String(slug));
        setUser(data);
      } catch (error: any) {
        toastError(error);
      }
    };

    fetchPost();
  }, [slug]);

  if (!user) return null;

  return (
    <div className="">
      <Profile user={user}/>
    </div>
  );
}
