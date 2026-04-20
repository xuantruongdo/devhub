import { LoginForm } from "@/components/Auth/LoginForm";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n";
import type { Locale } from "@/types/i18n";

type Params = Promise<{ locale: Locale }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations(locale);

  return {
    title: t.metadata.login.title,
    description: t.metadata.login.description,

    alternates: {
      languages: {
        en: "/en/login",
        vi: "/vi/login",
      },
    },
  };
}

const LoginPage = async () => {
  return <LoginForm />;
};

export default LoginPage;
