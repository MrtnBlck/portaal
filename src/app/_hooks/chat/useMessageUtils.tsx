import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { useQuery } from "convex/react";

export const useMessageUtils = (channelId: string) => {
  const messages = useQuery(api.messages.get, {
    id: channelId as Id<"channels">,
  });
  const lastSeenMessageId = useQuery(api.channel.getLastSeenMessageId, {
    channelId: channelId as Id<"channels">,
  });

  const getMessagePosition = (i: number) => {
    if (!messages?.[i]) {
      throw new Error("Message not found at index " + i);
    }
    const current = messages[i];
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const isPrevSame = prev?.isCurrentUser === current.isCurrentUser;
    const isNextSame = next?.isCurrentUser === current.isCurrentUser;

    if (!isPrevSame && !isNextSame) return "single";
    if (!isPrevSame && isNextSame) return "bottom";
    if (isPrevSame && !isNextSame) return "top";
    return "middle";
  };

  const getLastMessageStatus = () => {
    if (lastSeenMessageId === undefined || !messages?.length) return;
    const lastMessage = messages[0];
    if (!lastMessage?.isCurrentUser) return;
    return lastSeenMessageId === lastMessage.message._id ? "Seen" : "Delivered";
  };

  return {
    messages,
    getMessagePosition,
    getLastMessageStatus,
  };
};
