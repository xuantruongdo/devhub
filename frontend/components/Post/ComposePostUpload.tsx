"use client";

import { useMemo, useEffect } from "react";
import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { MAX_COUNT_FILE } from "@/constants";

interface ComposePostUploadProps {
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  max?: number;
  inputId: string;
}

export function ComposePostPreview({
  images,
  setImages,
}: {
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const previewUrls = useMemo(
    () => images.map((file) => URL.createObjectURL(file)),
    [images],
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  if (!images.length) return null;

  return (
    <div className="mt-3">
      <div className="grid grid-cols-3 gap-2 md:hidden">
        {previewUrls.map((url, i) => (
          <div
            key={i}
            className="relative w-full aspect-square overflow-hidden rounded-lg bg-muted"
          >
            <Image
              src={url}
              alt={`preview ${i}`}
              fill
              className="object-cover"
              sizes="33vw"
            />

            <button
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded-md hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="hidden md:flex gap-2 overflow-x-auto">
        {previewUrls.map((url, i) => (
          <div
            key={i}
            className="relative flex-shrink-0 w-40 h-40 rounded-lg overflow-hidden bg-muted"
          >
            <Image
              src={url}
              alt={`preview ${i}`}
              fill
              className="object-cover"
              sizes="160px"
            />

            <button
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded-md hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComposePostUpload({
  images,
  setImages,
  max = MAX_COUNT_FILE,
  inputId,
}: ComposePostUploadProps) {
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = max - images.length;
    const selectedFiles = files.slice(0, remaining);

    setImages((prev) => [...prev, ...selectedFiles]);
    e.target.value = "";
  };

  if (images.length >= max) return null;

  return (
    <>
      <Label
        htmlFor={inputId}
        className="inline-flex p-2 text-primary hover:bg-primary/10 rounded-full cursor-pointer"
      >
        <ImageIcon className="w-5 h-5" />
      </Label>
      <Input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
    </>
  );
}
