"use client";

import { useState } from "react";
import { Smile, Calendar, MapPin } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAppSelector } from "@/redux/hooks";
import { useTranslation } from "@/hooks/useTranslation";
import ComposePostUpload, { ComposePostPreview } from "../ComposePostUpload";

export default function ComposePost() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const user = useAppSelector((state) => state.currentUser);
  const { t, ready } = useTranslation();

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) return;

    const formData = new FormData();
    formData.append("content", content);

    images.forEach((file) => {
      formData.append("images", file);
    });

    console.log("[POST DATA]", { content, images });

    // TODO: call API
    // await fetch("/api/posts", { method: "POST", body: formData });

    setContent("");
    setImages([]);
  };

  if (!ready) return null;

  return (
    <div className="border-b border-border bg-card">
      <div className="md:hidden px-4 py-3 border-b border-border">
        <div className="flex flex-col gap-2">
          <div className="flex gap-3 items-center">
            <Avatar size="lg">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.fullName} />
              ) : (
                <AvatarFallback>
                  {user.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("composePost.placeholder")}
              className="flex-1 bg-muted resize-none max-h-[calc(1.5rem*4)] px-4 py-2 text-sm"
              rows={1}
              maxLength={500}
            />
          </div>

          <ComposePostPreview images={images} setImages={setImages} />

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <ComposePostUpload
                images={images}
                setImages={setImages}
                inputId="compose-post-image-mobile"
              />
              <button className="p-2 text-primary hover:bg-primary/10 rounded-full">
                <Smile className="h-5 w-5" />
              </button>
              <button className="p-2 text-primary hover:bg-primary/10 rounded-full">
                <Calendar className="h-5 w-5" />
              </button>
              <button className="p-2 text-primary hover:bg-primary/10 rounded-full">
                <MapPin className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={handlePost}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold"
            >
              Post
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block px-4 sm:px-6 py-6">
        <div className="flex gap-4">
          <Avatar size="lg">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.fullName} />
            ) : (
              <AvatarFallback>
                {user.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("composePost.placeholder")}
              className="w-full text-xl resize-none max-h-[calc(1.5rem*6)]"
              rows={1}
              maxLength={500}
            />

            <ComposePostPreview images={images} setImages={setImages} />

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <ComposePostUpload
                  images={images}
                  setImages={setImages}
                  inputId="compose-post-image-desktop"
                />
                <button className="p-2 text-primary hover:bg-primary/10 rounded-full">
                  <Smile className="h-5 w-5" />
                </button>
                <button className="p-2 text-primary hover:bg-primary/10 rounded-full">
                  <Calendar className="h-5 w-5" />
                </button>
                <button className="p-2 text-primary hover:bg-primary/10 rounded-full">
                  <MapPin className="h-5 w-5" />
                </button>
              </div>

              <button
                onClick={handlePost}
                className="px-8 py-2 bg-primary text-primary-foreground rounded-full font-bold"
              >
                {t("composePost.post")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
