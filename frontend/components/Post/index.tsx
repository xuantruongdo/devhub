import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  CircleCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface PostProps {
  author: {
    name: string;
    handle: string;
    avatar: string;
    isVerified?: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  image?: string;
}

export default function Post({
  author,
  content,
  timestamp,
  likes,
  comments,
  shares,
  image,
}: PostProps) {
  return (
    <article className="border-b border-border px-4 sm:px-6 py-4 hover:bg-muted/30 transition cursor-pointer">
      <div className="flex gap-3 sm:gap-4">
        <Avatar size="lg">
          {author.avatar ? (
            <AvatarImage src={author.avatar} alt={author.name} />
          ) : (
            <AvatarFallback>
              {author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <div className="flex items-center gap-1">
                <p className="font-bold text-foreground truncate">
                  {author.name}
                </p>
                {author.isVerified && (
                  <CircleCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-muted-foreground truncate hidden sm:block">
                {author.handle}
              </p>
              <span className="text-muted-foreground hidden sm:block">·</span>
              <p className="text-muted-foreground whitespace-nowrap text-sm">
                {timestamp}
              </p>
            </div>
            <button className="p-2 hover:bg-primary/10 rounded-full transition text-muted-foreground flex-shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Post Text */}
          <p className="mt-2 text-base text-foreground leading-relaxed">
            {content}
          </p>

          {/* Image */}
          {image && (
            <div className="mt-3 rounded-xl overflow-hidden border border-border bg-muted h-64 sm:h-72 w-full">
              <img
                src={image}
                alt="Post"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-4 max-w-xs text-muted-foreground text-sm">
            <button className="flex items-center gap-2 group flex-1">
              <div className="p-2 group-hover:bg-primary/10 rounded-full transition">
                <MessageCircle className="h-4 w-4 group-hover:text-primary" />
              </div>
              <span className="text-xs sm:text-sm group-hover:text-primary">
                {comments}
              </span>
            </button>

            <button className="flex items-center gap-2 group flex-1">
              <div className="p-2 group-hover:bg-primary/10 rounded-full transition">
                <Share className="h-4 w-4 group-hover:text-primary" />
              </div>
              <span className="text-xs sm:text-sm group-hover:text-primary">
                {shares}
              </span>
            </button>

            <button className="flex items-center gap-2 group flex-1">
              <div className="p-2 group-hover:bg-destructive/10 rounded-full transition">
                <Heart className="h-4 w-4 group-hover:text-destructive" />
              </div>
              <span className="text-xs sm:text-sm group-hover:text-destructive">
                {likes}
              </span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
