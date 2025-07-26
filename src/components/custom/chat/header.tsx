"use client";

import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { User } from "lucide-react";
import { useConversation } from "~/app/_hooks/chat/useConversation";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { HeaderSkeleton } from "./skeletons";
import HeaderDropdown from "./headerDropdown";

export default function Header() {
  const { channelId } = useConversation();
  const conversation = useQuery(api.conversation.get, {
    channelId: channelId as Id<"channels">,
  });

  if (!conversation) {
    return <HeaderSkeleton />;
  }

  const {
    username,
    avatarUrl: avatarImageUrl,
    channels,
    currentChannel,
  } = conversation;

  return (
    <div className="flex w-full flex-row items-center justify-between rounded-lg border border-neutral-400/5 bg-neutral-600/10 p-2 px-3">
      <div className="flex flex-row items-center gap-2">
        <Avatar className="size-8">
          <AvatarImage src={avatarImageUrl ?? ""} />
          <AvatarFallback>
            <User className="size-4" />
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-light leading-none text-neutral-100">
          {username}
        </span>
      </div>
      <HeaderDropdown channels={channels} currentChannel={currentChannel} />
    </div>
  );
}
