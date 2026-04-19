"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import userService from "@/services/user";
import { toastError } from "@/lib/toast";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types/user";
import Link from "next/link";
import { SEARCH_LIMIT } from "@/constants";

export default function SearchPage() {
  const { t, locale, ready } = useTranslation();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchUsers = async (reset = false) => {
    if (!query) return;

    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 0 : page;

      const { data } = await userService.search({
        q: query,
        size: SEARCH_LIMIT,
        from: currentPage * SEARCH_LIMIT,
      });

      const newUsers: User[] = data.hits || [];

      if (reset) {
        setUsers(newUsers);
      } else {
        setUsers((prev) => [...prev, ...newUsers]);
      }

      setHasMore(newUsers.length === SEARCH_LIMIT);

      if (!reset) setPage((p) => p + 1);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!query) return;

    setHasMore(true);
    fetchUsers(true);
  }, [query]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchUsers(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-lg font-semibold mb-4">
        {t("search.results")} "{query}"
      </h1>

      {loading && (
        <p className="text-sm text-muted-foreground">{t("search.searching")}</p>
      )}

      {!loading && users.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {t("search.noResults")}
        </p>
      )}

      <div className="space-y-3">
        {users.map((u) => (
          <Link
            href={`/${locale}/${u.username}`}
            key={u.id}
            className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted cursor-pointer transition"
          >
            <Avatar className="h-12 w-12">
              {u.avatar ? (
                <AvatarImage src={u.avatar} />
              ) : (
                <AvatarFallback>{u.fullName?.charAt(0)}</AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-1 flex-wrap">
                <p className="font-medium text-sm">{u.fullName}</p>

                {u.isVerified && (
                  <Image
                    src="/verification-badge.svg"
                    alt="verified"
                    width={16}
                    height={16}
                  />
                )}
              </div>

              <p className="text-xs text-muted-foreground">@{u.username}</p>

              {u.bio && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {u.bio}
                </p>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                {u.followerCount} {t("search.followers")}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {users.length > 0 && hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            {loadingMore ? t("search.loading") : t("search.loadMore")}
          </button>
        </div>
      )}

      {!hasMore && users.length > 0 && (
        <p className="text-center text-xs text-muted-foreground mt-6">
          {t("search.noMoreResult")}
        </p>
      )}
    </div>
  );
}
