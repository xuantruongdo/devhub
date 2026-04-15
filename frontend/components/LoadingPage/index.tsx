import { Loader2 } from "lucide-react";

export default function LoadingPage() {
  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-semibold text-foreground">DevHub</span>

        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
