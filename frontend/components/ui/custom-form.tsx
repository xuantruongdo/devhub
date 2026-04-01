"use client";

import * as React from "react";
import { UseFormReturn, FieldValues, SubmitHandler } from "react-hook-form";

interface CustomFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  id?: string;
  className?: string;
  children: React.ReactNode;
}

export function CustomForm<T extends FieldValues>({
  form,
  onSubmit,
  id = "custom-form",
  className,
  children,
}: CustomFormProps<T>) {
  return (
    <form id={id} onSubmit={form.handleSubmit(onSubmit)} className={className}>
      {children}
    </form>
  );
}
