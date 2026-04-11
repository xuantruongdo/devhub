export function MessageSkeleton({ isMine = false }: { isMine?: boolean }) {
  return (
    <div className="space-y-1 animate-pulse">
      <div
        className={`flex items-end gap-2 ${
          isMine ? "justify-end" : "justify-start"
        }`}
      >
        {!isMine && <div className="w-8 h-8 rounded-full bg-gray-200" />}

        <div
          className={`px-3 py-2 rounded-2xl max-w-[70%] ${
            isMine ? "bg-blue-200" : "bg-gray-200"
          }`}
        >
          <div className="h-3 w-32 rounded bg-gray-300 mb-2" />
          <div className="h-3 w-20 rounded bg-gray-300" />
        </div>
      </div>

      <div
        className={`h-3 w-10 bg-gray-200 rounded ${
          isMine ? "ml-auto" : "ml-10"
        }`}
      />
    </div>
  );
}
