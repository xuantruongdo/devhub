"use client";

import { Loader2 } from "lucide-react";

interface LoadingPageProps {
  loading?: boolean;
  children?: React.ReactNode;
}

export default function LoadingPage({
  loading = true,
  children,
}: LoadingPageProps) {
  if (!loading) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-semibold text-foreground">DevHub</span>
        </div>

        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />

        <div className="text-center">
          <p className="text-sm text-foreground">Loading...</p>
          <p className="text-xs text-muted-foreground mt-1">
            Connecting developers...
          </p>
        </div>
      </div>
    </div>
  );
}
