"use client";

import * as React from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Lock, Mail, UserRound } from "lucide-react";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputIcon } from "@/components/ui/input-icon";
import { InputPassword } from "@/components/ui/input-password";

const AUTO_ICON: Record<string, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  password: <Lock className="h-4 w-4" />,
  name: <UserRound className="h-4 w-4" />,
  fullName: <UserRound className="h-4 w-4" />,
};

function resolveIcon(
  name: string,
  type?: string,
  icon?: React.ReactNode,
): React.ReactNode | undefined {
  if (icon !== undefined) return icon;
  return AUTO_ICON[name] ?? AUTO_ICON[type ?? ""] ?? undefined;
}

type InputType = "text" | "email" | "password" | "number" | "tel" | "url";

interface CustomFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  type?: InputType;
  icon?: React.ReactNode | null;
  isRequired?: boolean;
  disabled?: boolean;
  className?: string;
  /** Pass the t() function to translate i18n error-key messages from Zod */
  t?: (key: string) => string;
}

export function CustomField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = "text",
  icon,
  isRequired = false,
  disabled = false,
  className,
  t,
}: CustomFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const resolvedIcon = resolveIcon(String(name), type, icon);
        const inputId = `field-${String(name)}`;
        const fieldLabel = label ?? String(name);

        const error = fieldState.error
          ? {
              ...fieldState.error,
              message: t
                ? t(fieldState.error.message ?? "")
                : fieldState.error.message,
            }
          : undefined;

        return (
          <Field data-invalid={fieldState.invalid} className={className}>
            {label !== null && (
              <FieldLabel htmlFor={inputId}>
                {fieldLabel}
                {isRequired && (
                  <span className="ml-0.5 text-destructive" aria-hidden>
                    *
                  </span>
                )}
              </FieldLabel>
            )}

            {type === "password" ? (
              <InputPassword
                {...field}
                id={inputId}
                placeholder={placeholder}
                aria-invalid={fieldState.invalid}
                disabled={disabled}
              />
            ) : resolvedIcon ? (
              <InputIcon
                {...field}
                id={inputId}
                type={type}
                placeholder={placeholder}
                aria-invalid={fieldState.invalid}
                autoComplete={type === "email" ? "email" : undefined}
                disabled={disabled}
                icon={resolvedIcon}
              />
            ) : (
              <Input
                {...field}
                id={inputId}
                type={type}
                placeholder={placeholder}
                aria-invalid={fieldState.invalid}
                disabled={disabled}
              />
            )}

            {fieldState.invalid && <FieldError errors={[error]} />}
          </Field>
        );
      }}
    />
  );
}
