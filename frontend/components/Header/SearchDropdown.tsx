"use client";

import { toastError } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import userService from "@/services/user";
import { User } from "@/types/user";
import { useDebounce } from "@/hooks/useDebounce";
import Image from "next/image";

export function SearchDropdown({
  query,
  onClose,
}: {
  query: string;
  onClose: () => void;
}) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 300);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setUsers([]);
    setActiveIndex(-1);
    onClose();
  };

  useEffect(() => {
    if (!debouncedQuery) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);

        const { data } = await userService.search({
          q: debouncedQuery,
          size: 5,
        });

        setUsers(data.hits || []);
      } catch (error: any) {
        toastError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!users.length) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % users.length);
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev <= 0 ? users.length - 1 : prev - 1));
      }

      if (e.key === "Enter" && activeIndex >= 0) {
        const user = users[activeIndex];
        handleClose();
        router.push(`/${locale}/${user.username}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [users, activeIndex]);

  if (!query) return null;

  return (
    <div
      ref={containerRef}
      className="fixed sm:absolute top-full mt-2 left-0 w-full min-w-[320px] bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
    >
      {loading && (
        <div className="p-3 text-sm text-muted-foreground">
          {t("header.search.loading")}
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="p-4 text-sm text-muted-foreground text-center">
          {t("header.search.noResults")}
        </div>
      )}

      {users.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground px-3 pt-3 pb-1 uppercase tracking-wider">
            {t("header.search.users")}
          </p>

          {users.map((u, index) => (
            <Link
              href={`/${locale}/${u.username}`}
              onClick={handleClose}
              key={u.id}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                ${index === activeIndex ? "bg-muted" : "hover:bg-muted"}`}
            >
              <Avatar size="lg">
                {u?.avatar ? (
                  <AvatarImage src={u.avatar} />
                ) : (
                  <AvatarFallback>{u.fullName.charAt(0)}</AvatarFallback>
                )}
              </Avatar>

              <div>
                <div className="flex items-center gap-1 flex-wrap">
                  <p className="text-sm font-medium">{u.fullName}</p>
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
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="border-t border-border px-3 py-2 text-center">
        <Link
          href={`/${locale}/search?q=${debouncedQuery}`}
          onClick={handleClose}
          className="text-xs text-primary hover:underline"
        >
          {t("header.search.viewAll")}
        </Link>
      </div>
    </div>
  );
}
