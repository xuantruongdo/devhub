"use client";

import Image from "next/image";
import { X, ImagePlus, Globe, Lock } from "lucide-react";
import { CustomDialog } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Post, PostInput, VisibilityOption } from "@/types/post";
import postService from "@/services/post";
import { toastError } from "@/lib/toast";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { uploadStorage } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { MAX_COUNT_FILE, PostVisibility } from "@/constants";
import { CustomSelect } from "../ui/select";

interface EditPostDialogProps {
  open: boolean;
  post: Post;
  onCancel: () => void;
  onSuccess: (post: Post) => void;
}

export function EditPostDialog({
  open,
  post,
  onCancel,
  onSuccess,
}: EditPostDialogProps) {
  const [content, setContent] = useState(post.content);
  const [images, setImages] = useState<string[]>(post.images ?? []);
  const [visibility, setVisibility] = useState(post.visibility);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, ready } = useTranslation();

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

  const totalImages = useMemo(
    () => images.length + previews.length,
    [images.length, previews.length],
  );

  const canAddMore = useMemo(() => totalImages < 5, [totalImages]);

  const handleAddImages = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - totalImages;
    const limited = files.slice(0, remaining);
    setNewFiles((prev) => [...prev, ...limited]);
    setPreviews((prev) => [
      ...prev,
      ...limited.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeExistingImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = async () => {
    try {
      const uploadedFiles = await uploadStorage(newFiles);

      const { data } = await postService.update<PostInput, Post>(post.id, {
        content,
        images: [...images, ...uploadedFiles],
        visibility,
      });

      onSuccess(data);
    } catch (error) {
      toastError(error);
    }
  };

  if (!open || !ready) return null;

  return (
    <CustomDialog
      title={t("editPost.title")}
      onCancel={onCancel}
      onConfirm={handleConfirm}
      confirmText={t("editPost.save")}
      cancelText={t("editPost.cancel")}
      className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <div className="flex flex-col gap-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("editPost.placeholder")}
          rows={4}
          className="resize-none"
        />

        <CustomSelect
          options={visibilityOptions}
          value={visibility}
          onValueChange={(v) => setVisibility(v as PostVisibility)}
        />

        {(images.length > 0 || previews.length > 0) && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <div
                key={`existing-${i}`}
                className="relative group rounded-lg overflow-hidden"
              >
                <Image
                  src={url}
                  alt={`image ${i}`}
                  width={200}
                  height={200}
                  className="w-full object-cover"
                />
                <button
                  onClick={() => removeExistingImage(i)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {previews.map((url, i) => (
              <div
                key={`new-${i}`}
                className="relative group rounded-lg overflow-hidden"
              >
                <Image
                  src={url}
                  alt={`new image ${i}`}
                  width={200}
                  height={200}
                  className="w-full h-24 object-cover"
                />
                <button
                  onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {canAddMore && (
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition w-fit"
            >
              <ImagePlus className="h-4 w-4" />
              {t("editPost.addImages")} ({totalImages}/{MAX_COUNT_FILE})
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleAddImages}
            />
          </>
        )}
      </div>
    </CustomDialog>
  );
}
