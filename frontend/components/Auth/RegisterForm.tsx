"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { CustomForm } from "@/components/ui/custom-form";
import { CustomField } from "@/components/ui/custom-field";

import { RegisterFormValues, registerSchema } from "@/validations/auth";
import { toastError, toastSuccess } from "@/lib/toast";
import authService from "@/services/auth";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";

export function RegisterForm() {
  const { t, locale, ready } = useTranslation();

  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const { confirmPassword, ...rest } = values;
      setLoading(true);
      await authService.register(rest);
      toastSuccess(t("auth.register.success.title"));
      setSubmitted(true);
    } catch (error) {
      toastError(t(`auth.register.response.${error}`));
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <div className="h-full flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl border border-border/60">
        <CardHeader className="pb-2 space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {t("auth.register.title")}
          </CardTitle>
          <CardDescription>{t("auth.register.description")}</CardDescription>
        </CardHeader>

        <Separator className="mb-2" />

        <CardContent className="pt-4">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <ShieldCheck className="h-14 w-14 text-green-500" />
              <p className="text-lg font-semibold">
                {t("auth.register.success.title")}
              </p>
              <p className="text-muted-foreground text-sm">
                {t("auth.register.success.description")}
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  form.reset();
                  setSubmitted(false);
                }}
              >
                {t("auth.register.success.cta")}
              </Button>
            </div>
          ) : (
            <CustomForm form={form} onSubmit={onSubmit} id="register-form">
              <FieldGroup>
                <CustomField
                  name="fullName"
                  control={form.control}
                  label={t("auth.register.form.fullName")}
                  placeholder={t("auth.register.placeholder.fullName")}
                  isRequired
                  t={t}
                />

                <CustomField
                  name="email"
                  control={form.control}
                  label={t("auth.register.form.email")}
                  placeholder={t("auth.register.placeholder.email")}
                  type="email"
                  isRequired
                  t={t}
                />

                <CustomField
                  name="password"
                  control={form.control}
                  label={t("auth.register.form.password")}
                  placeholder={t("auth.register.placeholder.password")}
                  type="password"
                  isRequired
                  t={t}
                />

                <CustomField
                  name="confirmPassword"
                  control={form.control}
                  label={t("auth.register.form.confirmPassword")}
                  placeholder={t("auth.register.placeholder.confirmPassword")}
                  type="password"
                  isRequired
                  t={t}
                />
              </FieldGroup>
            </CustomForm>
          )}
        </CardContent>

        {!submitted && (
          <CardFooter className="flex flex-col gap-3 pb-5">
            <Field orientation="horizontal" className="w-full">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => form.reset()}
              >
                {t("auth.register.actions.reset")}
              </Button>

              <Button
                type="submit"
                form="register-form"
                className="flex-1"
                loading={loading}
              >
                {t("auth.register.actions.submit")}
              </Button>
            </Field>

            <p className="text-sm text-muted-foreground text-center">
              {t("auth.register.footer.haveAccount")}{" "}
              <Link
                href={`/${locale}/login`}
                className="text-primary font-medium hover:underline underline-offset-4 transition-colors"
              >
                {t("auth.register.footer.login")}
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
