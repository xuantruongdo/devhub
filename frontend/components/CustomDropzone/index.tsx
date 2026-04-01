"use client";

import { useState, useRef } from "react";

interface CustomDropzoneProps {
  onImageSelect: (image: string) => void;
}

export default function CustomDropzone({ onImageSelect }: CustomDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      onImageSelect(result);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onImageSelect("");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="mx-6 my-4">
      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer
            transition-all duration-200 select-none
            ${
              isDragging
                ? "border-[#7F77DD] bg-[rgba(127,119,221,0.08)] scale-[1.01]"
                : "border-gray-200 hover:border-[#AFA9EC] hover:bg-[rgba(174,169,236,0.05)]"
            }
          `}
        >
          {/* Icon */}
          <div className="w-9 h-9 mx-auto mb-3 rounded-[10px] bg-gray-100 flex items-center justify-center">
            <svg
              className="w-[18px] h-[18px] stroke-gray-500"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth={1.8}
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>

          <p className="text-sm text-gray-500 mb-1">Kéo thả ảnh vào đây</p>
          <span className="text-xs text-gray-400">PNG, JPG, GIF tối đa 10MB</span>

          <div className="mt-3 inline-block px-4 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors">
            Chọn ảnh
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-52 object-cover block"
          />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/55 border-none flex items-center justify-center cursor-pointer transition-colors hover:bg-black/75"
          >
            <svg
              className="w-[14px] h-[14px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2.5}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}