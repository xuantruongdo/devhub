"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface EmojiPickerDropdownProps {
  onEmojiClick: (emojiData: any) => void;
  onClose: () => void;
  className?: string;
}

export const EmojiPickerDropdown = ({
  onEmojiClick,
  onClose,
  className,
}: EmojiPickerDropdownProps) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div ref={pickerRef} className={className}>
      <EmojiPicker onEmojiClick={onEmojiClick} />
    </div>
  );
};
