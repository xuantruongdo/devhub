"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toastError } from "@/lib/toast";
import Profile from "@/components/Profile";
import userService from "@/services/user";
import { User } from "@/types/user";
import { useAppDispatch } from "@/redux/hooks";
import { setUserPosts } from "@/redux/reducers/userPosts";

export default function ProfilePage() {
  const { slug } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const [userRes, postRes] = await Promise.all([
          userService.findByUsername(String(slug)),
          userService.findPostsByUsername(String(slug)),
        ]);

        setUser(userRes.data);
        dispatch(setUserPosts(postRes.data));
      } catch (error: any) {
        toastError(error);
      }
    };

    fetchData();
  }, [slug]);

  if (!user) return null;

  return <>{user && <Profile user={user} />}</>;
}
