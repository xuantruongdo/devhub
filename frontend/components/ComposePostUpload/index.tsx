"use client";

import { useMemo, useEffect } from "react";
import Image from "next/image";
import { X, Image as ImageIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ComposePostUploadProps {
  images: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  max?: number;
  inputId: string;
}

function RemoveButton({ onRemove }: { onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full"
    >
      <X className="w-3 h-3" />
    </button>
  );
}

function PreviewImg({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt="preview"
      width={500}
      height={500}
      className="w-auto h-auto object-cover"
    />
  );
}

export function ComposePostPreview({
  images,
  setImages,
}: Pick<ComposePostUploadProps, "images" | "setImages">) {
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

  if (images.length === 0) return null;

  const count = previewUrls.length;

  switch (count) {
    case 1:
      return (
        <div className="relative mt-3">
          <PreviewImg src={previewUrls[0]} />
          <RemoveButton onRemove={() => removeImage(0)} />
        </div>
      );
    case 2:
      return (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {previewUrls.map((url, i) => (
            <div key={i} className="relative">
              <PreviewImg src={url} />
              <RemoveButton onRemove={() => removeImage(i)} />
            </div>
          ))}
        </div>
      );
    case 3:
      return (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="relative row-span-2">
            <PreviewImg src={previewUrls[0]} />
            <RemoveButton onRemove={() => removeImage(0)} />
          </div>
          {previewUrls.slice(1).map((url, i) => (
            <div key={i + 1} className="relative">
              <PreviewImg src={url} />
              <RemoveButton onRemove={() => removeImage(i + 1)} />
            </div>
          ))}
        </div>
      );
    case 4:
      return (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {previewUrls.map((url, i) => (
            <div key={i} className="relative">
              <PreviewImg src={url} />
              <RemoveButton onRemove={() => removeImage(i)} />
            </div>
          ))}
        </div>
      );
    default:
      return (
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="relative row-span-2">
            <PreviewImg src={previewUrls[0]} />
            <RemoveButton onRemove={() => removeImage(0)} />
          </div>
          {previewUrls.slice(1, 5).map((url, i) => (
            <div key={i + 1} className="relative">
              <PreviewImg src={url} />
              {i === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-bold rounded-lg">
                  +{images.length - 4}
                </div>
              )}
              <RemoveButton onRemove={() => removeImage(i + 1)} />
            </div>
          ))}
        </div>
      );
  }
}

export default function ComposePostUpload({
  images,
  setImages,
  max = 5,
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
