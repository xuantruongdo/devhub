"use client";

import { useTranslation } from "@/hooks/useTranslation";

const MessagePage = () => {
  const { t, ready } = useTranslation();

  if (!ready) return null;

  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <p className="text-base font-medium">{t("chat.window.empty.title")}</p>
      <p className="text-xs mt-1">{t("chat.window.empty.description")}</p>
    </div>
  );
};

export default MessagePage;
