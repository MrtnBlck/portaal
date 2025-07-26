"use client";

import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NoConvDialog from "~/components/custom/chat/noConvDialog";
import {
  BodySkeleton,
  ConversationsSkeleton,
  HeaderSkeleton,
} from "~/components/custom/chat/skeletons";

export default function ChatPage() {
  const mostRecentChannel = useQuery(api.channel.getMostRecent);
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (mostRecentChannel) {
      const channelId = mostRecentChannel as string;
      router.push(`/chat/${channelId}`);
    } else if (mostRecentChannel === null) {
      setDialogOpen(true);
    }
  }, [mostRecentChannel, router]);

  const handleDialogClose = () => {
    router.push("/projects");
  };

  return (
    <>
      <ConversationsSkeleton />
      <div className="flex max-w-full flex-1 flex-col gap-3 overflow-hidden">
        <HeaderSkeleton />
        <BodySkeleton />
      </div>
      <NoConvDialog
        dialogOpen={dialogOpen}
        handleDialogClose={handleDialogClose}
      />
    </>
  );
}
