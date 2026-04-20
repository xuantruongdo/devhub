import type { Metadata } from "next";
import { RegisterForm } from "@/components/Auth/RegisterForm";
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
    title: t.metadata.register.title,
    description: t.metadata.register.description,

    alternates: {
      languages: {
        en: "/en/register",
        vi: "/vi/register",
      },
    },
  };
}

const RegisterPage = async () => {
  return <RegisterForm />;
};

export default RegisterPage;
