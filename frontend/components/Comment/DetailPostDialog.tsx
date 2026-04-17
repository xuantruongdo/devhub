"use client";

import { useRouter } from "next/navigation";
import { CustomDialog } from "../ui/dialog";
import { Post } from "@/types/post";
import { DetailPostContent } from "./DetailPostContent";

interface DetailPostDialogProps {
  post: Post;
}

export function DetailPostDialog({ post }: DetailPostDialogProps) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <CustomDialog
      open={true}
      title={""}
      onCancel={handleClose}
      onConfirm={() => {}}
      className="max-h-[60vh] sm:max-h-[90vh] sm:max-w-2xl overflow-y-auto"
      hideCancelButton={true}
      hideConfirmButton={true}
      contentClassName="overflow-y-hidden"
    >
      <DetailPostContent post={post} onCloseDetailPost={handleClose} />
    </CustomDialog>
  );
}
