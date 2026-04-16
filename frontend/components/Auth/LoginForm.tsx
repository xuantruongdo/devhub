"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { LoginFormValues, loginSchema } from "@/validations/auth";
import { toastError, toastSuccess } from "@/lib/toast";
import authService from "@/services/auth";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { setCurrentUser } from "@/redux/reducers/currentUser";
import Link from "next/link";
import Image from "next/image";
import { getGoogleOAuthURL } from "@/lib/google";
import { useState } from "react";

export function LoginForm() {
  const { t, locale, ready } = useTranslation();
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      const { data } = await authService.login(values);
      dispatch(setCurrentUser(data.user));
      localStorage.setItem("accessToken", data.accessToken);
      toastSuccess(t("auth.login.success.title"));
      router.push(`/${locale}`);
    } catch (error) {
      toastError(t(`auth.login.response.${error}`));
    } finally {
      setLoading(false);
    }
  };

  const onLoginGoogle = async () => {
    try {
      const googleUrl = getGoogleOAuthURL();
      console.log("===googleUrl", googleUrl);
      window.location.href = googleUrl;
    } catch (error) {
      toastError(error);
    }
  };

  if (!ready) return null;

  return (
    <div className="h-full flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl border border-border/60">
        <CardHeader className="pb-2 space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {t("auth.login.title")}
          </CardTitle>
          <CardDescription>{t("auth.login.description")}</CardDescription>
        </CardHeader>

        <Separator className="mb-2" />

        <CardContent className="pt-4">
          <CustomForm form={form} onSubmit={onSubmit} id="login-form">
            <FieldGroup>
              <CustomField
                name="email"
                control={form.control}
                label={t("auth.login.form.email")}
                placeholder={t("auth.login.placeholder.email")}
                type="email"
                isRequired
                t={t}
              />
              <CustomField
                name="password"
                control={form.control}
                label={t("auth.login.form.password")}
                placeholder={t("auth.login.placeholder.password")}
                type="password"
                isRequired
                t={t}
              />
            </FieldGroup>
          </CustomForm>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-5">
          <Field orientation="horizontal" className="w-full">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => form.reset()}
            >
              {t("auth.login.actions.reset")}
            </Button>

            <Button
              type="submit"
              form="login-form"
              className="flex-1"
              loading={loading}
            >
              {t("auth.login.actions.submit")}
            </Button>
          </Field>

          <p className="text-sm text-muted-foreground text-center">
            {t("auth.login.footer.noAccount")}{" "}
            <Link
              href={`/${locale}/register`}
              className="text-primary font-medium hover:underline underline-offset-4 transition-colors"
            >
              {t("auth.login.footer.register")}
            </Link>
          </p>

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={onLoginGoogle}
          >
            <Image
              src="/images/google.webp"
              alt="Google"
              width={18}
              height={18}
            />
            {t("auth.login.footer.google")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
