"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toastError } from "@/lib/toast";
import Profile from "@/components/Profile";
import userService from "@/services/user";
import { User } from "@/types/user";
import { useAppDispatch } from "@/redux/hooks";
import { setUserPosts } from "@/redux/reducers/userPosts";
import NotFound from "@/components/NotFound";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProfilePage() {
  const { slug } = useParams();
  const { t, ready } = useTranslation();

  const [user, setUser] = useState<User | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!slug || !ready) return;

    const fetchData = async () => {
      try {
        const [userRes, postRes] = await Promise.all([
          userService.findByUsername(String(slug)),
          userService.findPostsByUsername(String(slug)),
        ]);

        setUser(userRes.data);
        dispatch(setUserPosts(postRes.data));
      } catch (error: any) {
        toastError(t(`profile.response.${error}`));
      }
    };

    fetchData();
  }, [slug, ready]);

  if (!user) return <NotFound />;

  return <Profile user={user} />;
}
