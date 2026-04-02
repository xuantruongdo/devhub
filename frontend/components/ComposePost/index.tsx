"use client";

import { useState } from "react";
import { Smile, Calendar, MapPin } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAppSelector } from "@/redux/hooks";
import { useTranslation } from "@/hooks/useTranslation";
import ComposePostUpload, { ComposePostPreview } from "../ComposePostUpload";
import storageService from "@/services/storage";
import { uploadFileToS3 } from "@/lib/utils";
import { Button } from "../ui/button";
import { toastError } from "@/lib/toast";
import postService from "@/services/post";
import { Post, PostInput } from "@/types/post";

interface ComposePostProps {
  onPostCreated?: (post: Post) => void;
}

export default function ComposePost({ onPostCreated }: ComposePostProps) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const user = useAppSelector((state) => state.currentUser);
  const { t, ready } = useTranslation();

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) return;
    setLoading(true);

    try {
      const storageDomain = process.env.NEXT_PUBLIC_S3_DOMAIN!;

      const uploadPromises = images.map(async (file) => {
        try {
          const { data: presignedUrl } = await storageService.getPresignUrl({
            fileName: file.name,
            fileType: file.type,
          });

          const uploadedUrl = await uploadFileToS3(file, presignedUrl);

          const pathOnly = uploadedUrl.replace(storageDomain, "").split("?")[0];

          return pathOnly;
        } catch (err) {
          console.error("Upload failed for", file.name, err);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const uploadedFiles = results.filter(Boolean) as string[];

      const { data } = await postService.create<PostInput, Post>({
        content,
        images: uploadedFiles,
      });

      if (onPostCreated) onPostCreated(data);

      setContent("");
      setImages([]);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="border-b border-border bg-card">
      <div className="md:hidden px-4 py-3 border-b border-border">
        <div className="flex flex-col gap-2">
          <div className="flex gap-3 items-center">
            <Avatar size="lg">
              {user.avatar ? (
                <AvatarImage
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-auto h-auto object-cover"
                />
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

            <Button
              onClick={handlePost}
              disabled={!content.trim() && images.length === 0}
              loading={loading}
              className={`
                px-6 py-4 rounded-full font-bold text-primary-foreground 
                ${
                  !content.trim() && images.length === 0
                    ? "bg-primary opacity-50 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 transition-colors duration-200"
                }
              `}
            >
              {t("composePost.post")}
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden md:block px-4 sm:px-6 py-6">
        <div className="flex gap-4">
          <Avatar size="lg">
            {user.avatar ? (
              <AvatarImage
                src={user.avatar}
                alt={user.fullName}
                className="w-auto h-auto object-cover"
              />
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

              <Button
                onClick={handlePost}
                disabled={!content.trim() && images.length === 0}
                loading={loading}
                className={`
                  px-8 py-5 rounded-full font-bold text-primary-foreground cursor-pointer 
                  ${
                    !content.trim() && images.length === 0
                      ? "bg-primary opacity-50 cursor-not-allowed"
                      : "bg-primary hover:bg-primary/90 transition-colors duration-200"
                  }
                `}
              >
                {t("composePost.post")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
