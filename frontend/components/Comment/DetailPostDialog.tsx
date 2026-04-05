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
  }

  return (
    <CustomDialog
      title={""}
      onCancel={handleClose}
      onConfirm={() => {}}
      className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
      hideCancelButton={true}
      hideConfirmButton={true}
    >
      <DetailPostContent post={post} onCloseDetailPost={handleClose} />
    </CustomDialog>
  );
}
