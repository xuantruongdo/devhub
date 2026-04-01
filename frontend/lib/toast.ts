import { toast } from "sonner";

export const toastSuccess = (message: string) => {
  toast.success(message);
};

export const toastError = (message: unknown) => {
  toast.error(typeof message === "string" ? message : "Something went wrong");
};

export const toastInfo = (message: string) => {
  toast(message);
};
