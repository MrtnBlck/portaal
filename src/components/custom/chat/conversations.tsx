"use client";

import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useConversation } from "~/app/_hooks/chat/useConversation";
import { ConversationsSkeleton } from "./skeletons";
import ConversationsItem from "./conversationsItem";

export default function Conversations() {
  const conversations = useQuery(api.conversations.get);
  const { channelId } = useConversation();
  const activeChannelId = channelId as Id<"channels">;

  if (!conversations) {
    return <ConversationsSkeleton />;
  }

  return (
    <div className="no-scrollbar flex w-80 max-w-80 flex-col gap-1.5 overflow-hidden overflow-y-scroll">
      {conversations.map((conversation) => {
        const channels = conversation.channels.map(
          (channel) => channel.channelId,
        );
        return (
          <ConversationsItem
            key={channels[0]}
            avatarImageUrl={conversation.avatarUrl}
            username={conversation.username}
            selected={channels.includes(activeChannelId)}
            channelId={conversation.mostRecentChannel}
            channels={conversation.channels}
          />
        );
      })}
    </div>
  );
}
