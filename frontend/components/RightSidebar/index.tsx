"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { toastError } from "@/lib/toast";
import userService from "@/services/user";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { User } from "@/types/user";

export default function RightSidebar() {
  const { t, locale } = useTranslation();

  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggested = async () => {
    try {
      setLoading(true);
      const { data } = await userService.suggest();
      setSuggestedUsers(data);
    } catch (error: any) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggested();
  }, []);

  const handleFollow = async (userId: number) => {
    const prevState = suggestedUsers;

    try {
      setSuggestedUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, isFollowing: !user.isFollowing }
            : user,
        ),
      );

      await userService.toggleFollow(userId);
    } catch (error: any) {
      setSuggestedUsers(prevState);
      toastError(error);
    }
  };

  return (
    <aside className="hidden xl:flex w-80 bg-card flex-col border-l border-border overflow-hidden">
      <div className="mt-4 mx-3 rounded-2xl bg-muted">
        <div className="p-4 pb-2">
          <h2 className="text-xl font-bold text-foreground">
            {t("rightSidebar.suggestedForYou")}
          </h2>
        </div>

        <div>
          {loading ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              {t("rightSidebar.loading")}
            </p>
          ) : suggestedUsers.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              {t("rightSidebar.noSuggestions")}
            </p>
          ) : (
            suggestedUsers.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between px-4 py-3 transition ${
                  index !== suggestedUsers.length - 1
                    ? "border-b border-border"
                    : ""
                }`}
              >
                <Link
                  href={`/${locale}/${user.username}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <Avatar className="w-10 h-10">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} />
                    ) : (
                      <AvatarFallback>
                        {user.fullName?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 min-w-0">
                      <p className="font-bold text-foreground truncate">
                        {user.fullName}
                      </p>

                      {user.isVerified && (
                        <Image
                          src="/verification-badge.svg"
                          alt="verified"
                          width={16}
                          height={16}
                          className="flex-shrink-0"
                        />
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground truncate">
                      @{user.username}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={() => handleFollow(user.id)}
                  className={`px-4 py-1.5 rounded-full font-bold transition text-sm flex-shrink-0 ml-2 disabled:opacity-50 ${
                    user.isFollowing
                      ? "bg-muted text-foreground border border-border"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}
                >
                  {user.isFollowing
                    ? t("rightSidebar.following")
                    : t("rightSidebar.follow")}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
