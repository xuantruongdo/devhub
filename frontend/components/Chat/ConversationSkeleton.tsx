export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-gray-200" />

      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <div className="h-3 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-6 bg-gray-200 rounded-full" />
        </div>

        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
