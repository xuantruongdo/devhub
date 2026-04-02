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
