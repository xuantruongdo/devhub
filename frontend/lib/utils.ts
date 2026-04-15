import storageService from "@/services/storage";
import { Conversation, Message } from "@/types/chat";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uploadFileToS3 = async (file: File, presignedUrl: string) => {
  const res = await fetch(presignedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!res.ok)
    throw new Error(`Upload failed: ${res.status} ${res.statusText}`);

  return presignedUrl;
};

export async function uploadStorage(files: File[]) {
  const storageDomain = process.env.NEXT_PUBLIC_S3_DOMAIN!;

  const results = await Promise.allSettled(
    files.map(async (file) => {
      const { data: presignedUrl } = await storageService.getPresignUrl({
        fileName: file.name,
        fileType: file.type,
      });

      const uploadedUrl = await uploadFileToS3(file, presignedUrl);

      return uploadedUrl.replace(storageDomain, "").split("?")[0];
    }),
  );

  const success = results
    .filter((r) => r.status === "fulfilled")
    .map((r: any) => r.value);

  const failed = results.filter((r) => r.status === "rejected");

  if (failed.length) {
    console.warn(`${failed.length} uploads failed`);
  }

  return success;
}

export const navigateFromModal = (router: any, url: string) => {
  router.back();
  setTimeout(() => {
    router.push(url);
  }, 50);
};

export const scrollToBottom = (el: HTMLDivElement | null, smooth = true) => {
  if (!el) return;

  el.scrollTo({
    top: el.scrollHeight,
    behavior: smooth ? "smooth" : "auto",
  });

  setTimeout(() => {
    el.scrollTop = el.scrollHeight;
  }, 50);
};

export const isMe = (userId: number, currentUserId: number) => {
  return userId === currentUserId;
};

export const getOtherUser = (c: Conversation, currentUserId: number) => {
  return c.participants.find((p) => !isMe(p.userId, currentUserId))?.user;
};

export const getUnread = (
  conversations: Conversation[],
  currentUserId: number,
) => {
  return conversations.reduce((sum, c) => {
    const me = c.participants?.find((p) => isMe(p.userId, currentUserId));

    return sum + (me?.unreadCount ?? 0);
  }, 0);
};

export const formatDuration = (sec: number) => {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};
