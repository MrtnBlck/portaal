import { Skeleton } from "~/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <div className="flex w-full flex-row items-center justify-between rounded-lg border border-neutral-400/5 bg-neutral-600/10 p-2">
      <div className="flex flex-row items-center gap-2">
        <Skeleton className="full min-h-8 min-w-8 rounded-full" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export function BodySkeleton() {
  return (
    <div className="relative flex size-full max-w-full flex-col overflow-hidden rounded-lg rounded-b-3xl border border-neutral-400/5 bg-neutral-600/10">
      <div className="absolute bottom-0 w-full p-2 pb-3">
        <div className="flex size-full flex-row items-end gap-2 px-1">
          <Skeleton className="min-h-[34px] flex-1 rounded-3xl" />
          <Skeleton className="min-h-[34px] min-w-[34px] rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ConversationsSkeleton() {
  return (
    <div className="no-scrollbar flex min-w-80 flex-col gap-1.5 overflow-y-scroll">
      {Array.from({ length: 5 }).map((_, i) => (
        <ConversationItemSkeleton key={i} />
      ))}
    </div>
  );
}

function ConversationItemSkeleton() {
  return (
    <div className="flex min-h-[63.8px] w-full select-none flex-row items-center gap-2.5 rounded-lg border border-neutral-400/5 bg-neutral-600/10 px-3.5 py-2.5">
      <Skeleton className="min-h-9 min-w-9 rounded-full" />
      <div className="flex w-full flex-row items-center">
        <div className="flex flex-col gap-1.5 py-1">
          <Skeleton className="w h-3 w-[200px]" />
          <Skeleton className="w h-3 w-[150px]" />
        </div>
      </div>
    </div>
  );
}
