"use client";

import { useState } from "react";
import { Smile, Calendar, MapPin, Globe, Lock } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAppSelector } from "@/redux/hooks";
import { useTranslation } from "@/hooks/useTranslation";
import { uploadStorage } from "@/lib/utils";
import { Button } from "../ui/button";
import { toastError } from "@/lib/toast";
import postService from "@/services/post";
import { Post, PostInput, VisibilityOption } from "@/types/post";
import ComposePostUpload, { ComposePostPreview } from "./ComposePostUpload";
import { MAX_POST_CONTENT, PostVisibility } from "@/constants";
import { CustomSelect } from "../ui/select";

interface ComposePostProps {
  onSuccess: (post: Post) => void;
}

export default function ComposePost({ onSuccess }: ComposePostProps) {
  const user = useAppSelector((state) => state.currentUser);
  const { t } = useTranslation();
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState<PostVisibility>(
    PostVisibility.PUBLIC,
  );

  const visibilityOptions: VisibilityOption[] = [
    {
      label: t("composePost.visibility.public"),
      value: PostVisibility.PUBLIC,
      icon: <Globe className="w-4 h-4" />,
    },
    {
      label: t("composePost.visibility.private"),
      value: PostVisibility.PRIVATE,
      icon: <Lock className="w-4 h-4" />,
    },
  ];

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) return;
    setLoading(true);

    try {
      const uploadedFiles = await uploadStorage(images);

      const { data } = await postService.create<PostInput, Post>({
        content,
        images: uploadedFiles,
        visibility,
      });

      onSuccess(data);

      setContent("");
      setImages([]);
      setVisibility(PostVisibility.PUBLIC);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  const canPost = content.trim() || images.length > 0;

  return (
    <div className="border-b border-border bg-card px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex gap-3">
        <Avatar size="lg" className="shrink-0 mt-0.5">
          {user.avatar ? (
            <AvatarImage src={user.avatar} alt={user.fullName} />
          ) : (
            <AvatarFallback className="uppercase">
              {user.fullName.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("composePost.placeholder")}
            maxLength={MAX_POST_CONTENT}
            rows={2}
            className="border-none !bg-transparent rounded-none shadow-none resize-none outline-none ring-0 
             focus-visible:ring-0 focus-visible:border-none
             text-base sm:text-lg leading-relaxed px-0 py-0 min-h-0"
          />

          <div className="flex items-center justify-between">
            <CustomSelect
              options={visibilityOptions}
              value={visibility}
              onValueChange={(v) => setVisibility(v as PostVisibility)}
              className="h-7 text-xs font-medium text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-full px-3"
            />
            {content.length > 0 && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {content.length} / {MAX_POST_CONTENT}
              </span>
            )}
          </div>

          <ComposePostPreview images={images} setImages={setImages} />

          <div className="border-t border-border" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5 -ml-2">
              <ComposePostUpload
                images={images}
                setImages={setImages}
                inputId="compose-post-image"
              />
              {[
                { icon: Smile, label: "emoji" },
                { icon: Calendar, label: "schedule" },
                { icon: MapPin, label: "location" },
              ].map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            <Button
              onClick={handlePost}
              disabled={!canPost}
              loading={loading}
              className="rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {t("composePost.post")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
