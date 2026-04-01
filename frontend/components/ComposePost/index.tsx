"use client";

import { useState } from "react";
import { Smile, Calendar, MapPin, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function ComposePost() {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handlePost = () => {
    if (content.trim() || selectedImage) {
      console.log("[v0] Posting:", content, selectedImage);
      setContent("");
      setSelectedImage(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => setSelectedImage(null);

  return (
    <div className="border-b border-border bg-card">
      {/* Compact Mobile View */}
      <div className="md:hidden px-4 py-3 border-b border-border">
        <div className="flex flex-col gap-2">
          <div className="flex gap-3 items-center">
            <Avatar size="lg">
              {false ? (
                <AvatarImage src={""} alt={"User"} />
              ) : (
                <AvatarFallback>T</AvatarFallback>
              )}
            </Avatar>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none resize-none overflow-y-auto max-h-[calc(1.5rem*4)] px-4 py-2 text-sm"
              rows={1}
              maxLength={500}
            />
          </div>

          {/* Image Preview */}
          {selectedImage && (
            <div className="relative mt-2">
              <Image
                src={selectedImage}
                alt="Preview"
                className="max-h-48 w-full object-contain rounded-md border border-border"
                width={80}
                height={80}
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-2">
              <Label
                htmlFor="compose-post-image-mobile"
                className="p-2 text-primary hover:bg-primary/10 rounded-full transition cursor-pointer"
                title="Upload image"
              >
                <ImageIcon className="h-5 w-5" />
              </Label>
              <Input
                id="compose-post-image-mobile"
                type="file"
                name="compose-post-image-mobile"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                className="p-2 text-primary hover:bg-primary/10 rounded-full transition"
                title="Add emoji"
              >
                <Smile className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-primary hover:bg-primary/10 rounded-full transition"
                title="Schedule post"
              >
                <Calendar className="h-5 w-5" />
              </button>
              <button
                className="p-2 text-primary hover:bg-primary/10 rounded-full transition"
                title="Add location"
              >
                <MapPin className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={handlePost}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:shadow-lg transition"
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block px-4 sm:px-6 py-6">
        <div className="flex gap-4">
          <Avatar size="lg">
            {false ? (
              <AvatarImage src={""} alt={"User"} />
            ) : (
              <AvatarFallback>T</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-transparent text-xl text-foreground placeholder-muted-foreground focus:outline-none resize-none overflow-y-auto max-h-[calc(1.5rem*6)]"
              rows={1}
              maxLength={500}
            />

            {selectedImage && (
              <div className="relative mt-4">
                <Image
                  src={selectedImage}
                  alt="Preview"
                  className="max-h-64 w-full object-contain rounded-md border border-border"
                  width={80}
                  height={80}
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <Label
                  htmlFor="compose-post-image-desktop"
                  className="p-2 text-primary hover:bg-primary/10 rounded-full transition cursor-pointer"
                  title="Upload image"
                >
                  <ImageIcon className="h-5 w-5" />
                </Label>
                <Input
                  id="compose-post-image-desktop"
                  type="file"
                  name="compose-post-image-desktop"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  className="p-2 text-primary hover:bg-primary/10 rounded-full transition"
                  title="Add emoji"
                >
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  className="p-2 text-primary hover:bg-primary/10 rounded-full transition"
                  title="Schedule post"
                >
                  <Calendar className="h-5 w-5" />
                </button>
                <button
                  className="p-2 text-primary hover:bg-primary/10 rounded-full transition"
                  title="Add location"
                >
                  <MapPin className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={handlePost}
                className="px-8 py-2 bg-primary text-primary-foreground rounded-full font-bold hover:shadow-lg transition"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
