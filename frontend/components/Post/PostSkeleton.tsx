export function PostSkeleton() {
  return (
    <div className="p-3 border-b border-border animate-pulse space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-muted" />
        <div className="flex-1 space-y-1">
          <div className="h-2.5 w-28 bg-muted rounded" />
          <div className="h-2.5 w-16 bg-muted rounded" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="h-2.5 w-full bg-muted rounded" />
        <div className="h-2.5 w-4/5 bg-muted rounded" />
      </div>

      <div className="w-full aspect-[16/9] bg-muted rounded-md" />

      <div className="flex items-center gap-2 pt-1">
        <div className="h-7 w-12 bg-muted rounded" />
        <div className="h-7 w-14 bg-muted rounded" />
        <div className="h-7 w-14 bg-muted rounded" />
      </div>
    </div>
  );
}
