"use client";

import { CustomDialog } from "../ui/dialog";

interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  if (!open) return null;

  return (
    <CustomDialog
      title={title}
      description={description}
      onCancel={onCancel}
      onConfirm={onConfirm}
      confirmText="Delete"
      cancelText="Cancel"
      confirmVariant="destructive"
    />
  );
}
