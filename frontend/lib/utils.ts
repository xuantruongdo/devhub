import storageService from "@/services/storage";
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
