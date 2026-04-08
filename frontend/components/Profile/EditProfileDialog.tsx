import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomDialog } from "@/components/ui/dialog";
import { CustomForm } from "@/components/ui/custom-form";
import { CustomField } from "@/components/ui/custom-field";
import userService from "@/services/user";
import { UpdateUserResponse, User } from "@/types/user";
import moment from "moment";
import { EditProfileForm, editProfileSchema } from "@/validations/auth";
import { useTranslation } from "@/hooks/useTranslation";
import { toastError, toastSuccess } from "@/lib/toast";

interface EditProfileDialogProps {
  user: User;
  open: boolean;
  onClose: () => void;
  onUpdated: (updatedUser: User) => void;
}

export default function EditProfileDialog({
  user,
  open,
  onClose,
  onUpdated,
}: EditProfileDialogProps) {
  const { t } = useTranslation();

  const form = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: user.fullName || "",
      bio: user.bio || "",
      website: user.website || "",
      location: user.location || "",
      birthday: user.birthday ? moment(user.birthday).format("YYYY-MM-DD") : "",
      email: user.email || "",
      username: user.username || "",
    },
  });

  useEffect(() => {
    form.reset({
      fullName: user.fullName || "",
      bio: user.bio || "",
      website: user.website || "",
      location: user.location || "",
      birthday: user.birthday ? moment(user.birthday).format("YYYY-MM-DD") : "",
      email: user.email || "",
      username: user.username || "",
    });
  }, [user, form]);

  const handleSubmit = async (values: EditProfileForm) => {
    try {
      const { email, username, ...rest } = values;
      const dto = {
        ...rest,
        birthday: rest.birthday ? new Date(rest.birthday) : undefined,
      };

      const { data } = await userService.update<
        Partial<User>,
        UpdateUserResponse
      >(user.id, dto);
      onUpdated(data.user);
      localStorage.setItem("accessToken", data.accessToken);
      toastSuccess(t("profile.profileUpdatedSuccess"));
      onClose();
    } catch (error: any) {
      toastError(error);
    }
  };

  return (
    <CustomDialog
      title={t("profile.editProfile")}
      open={open}
      onCancel={onClose}
      onConfirm={form.handleSubmit(handleSubmit)}
      cancelText={t("profile.cancel")}
      confirmText={t("profile.save")}
      className="sm:max-w-2xl overflow-y-auto"
    >
      <CustomForm
        form={form}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 px-4"
      >
        <CustomField
          name="email"
          control={form.control}
          label="Email"
          placeholder="Enter your email"
          disabled
        />

        <CustomField
          name="username"
          control={form.control}
          label="Username"
          placeholder="Enter your username"
          disabled
        />

        <CustomField
          name="fullName"
          control={form.control}
          label={t("profile.fullName")}
          placeholder={t("profile.fullNamePlaceholder")}
          isRequired
        />

        <CustomField
          name="bio"
          control={form.control}
          label={t("profile.bio")}
          placeholder={t("profile.bioPlaceholder")}
        />

        <CustomField
          name="website"
          control={form.control}
          label="Website"
          placeholder="https://example.com"
          type="url"
        />

        <CustomField
          name="location"
          control={form.control}
          label={t("profile.location")}
          placeholder={t("profile.locationPlaceholder")}
        />

        <CustomField
          name="birthday"
          control={form.control}
          label={t("profile.birthday")}
          type="date"
        />
      </CustomForm>
    </CustomDialog>
  );
}
