import HeaderAuth from "@/components/Auth/HeaderAuth";
import { LocaleType } from "@/constants";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const locales = [LocaleType.EN, LocaleType.VI] as const;
export type Locale = (typeof locales)[number];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="flex flex-col overflow-hidden">
      <HeaderAuth />
      <div className="h-[80vh]">{children}</div>
    </div>
  );
};

export default PublicLayout;
