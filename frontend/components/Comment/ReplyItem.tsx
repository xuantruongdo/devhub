"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import moment from "moment";
import { Heart, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Comment } from "@/types/post";
import { useAppSelector } from "@/redux/hooks";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

interface ReplyItemProps {
  reply: Comment;
  onLike: (commentId: number) => void;
  onDelete: (commentId: number) => void;
}

export function ReplyItem({ reply: r, onLike, onDelete }: ReplyItemProps) {
  const currentUser = useAppSelector((state) => state.currentUser);
  const { t, locale } = useTranslation();

  return (
    <div className="flex gap-3 relative">
      <Link href={`/${locale}/${r.author.username}`}>
        <Avatar size="sm">
          <AvatarImage src={r.author.avatar} />
          <AvatarFallback>{r.author.fullName.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1">
        <div className="flex justify-between items-start">
          <Link href={`/${locale}/${r.author.username}`}>
            <div className="text-sm font-semibold">{r.author.fullName}</div>
          </Link>

          {currentUser.id === r.author.id && (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1 rounded hover:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => onDelete(r.id)}
                  className="text-red-500 focus:text-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />{" "}
                  {t("comment.actions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          {moment(r.createdAt).fromNow()}
        </div>

        <p className="text-sm">{r.content}</p>

        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
          <button
            className="flex items-center group cursor-pointer"
            onClick={() => onLike(r.id)}
          >
            <div className="p-2 group-hover:bg-destructive/10 rounded-full transition">
              <Heart
                className={`h-4 w-4 transition ${
                  r.isLiked
                    ? "text-red-500 fill-red-500"
                    : "group-hover:text-destructive"
                }`}
              />
            </div>
            <span
              className={`text-xs sm:text-sm ${
                r.isLiked ? "text-red-500" : "group-hover:text-destructive"
              }`}
            >
              {r.likeCount}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
