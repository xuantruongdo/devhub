"use client";

import { CustomDialog } from "../ui/dialog";

interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  cancelText?: string;
  confirmText?: string;
}

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Delete",
}: ConfirmDeleteDialogProps) {
  return (
    <CustomDialog
      open={open}
      title={title}
      description={description}
      onCancel={onCancel}
      onConfirm={onConfirm}
      cancelText={cancelText}
      confirmText={confirmText}
      confirmVariant="destructive"
    />
  );
}
