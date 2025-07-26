"use client";

import { useMutationState } from "~/app/_hooks/useMutationState";
import { useEffect, useRef } from "react";
import { useConversation } from "~/app/_hooks/chat/useConversation";
import { useMessageUtils } from "~/app/_hooks/chat/useMessageUtils";
import { BodySkeleton } from "./skeletons";
import Message from "./message";
import Input from "./input";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";

export function Body() {
  const { channelId } = useConversation();
  const { messages, getMessagePosition, getLastMessageStatus } =
    useMessageUtils(channelId);

  const { mutate: updateLastSeenMessage } = useMutationState(
    api.channel.updateLastSeenMessage,
  );
  const lastSeenRef = useRef<string | null>(null);

  useEffect(() => {
    const updateLastSeen = () => {
      if (!messages?.length) return;
      const lastMessage = messages[0];
      if (!lastMessage) return;
      if (lastSeenRef.current === lastMessage.message._id) return;

      void updateLastSeenMessage({
        channelId: channelId as Id<"channels">,
        messageId: lastMessage.message._id,
      });
      lastSeenRef.current = lastMessage.message._id as string;
    };

    // Only run initially if tab is visible
    if (document.hasFocus()) {
      updateLastSeen();
    }

    const handleFocus = () => {
      updateLastSeen();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [channelId, messages, updateLastSeenMessage]);

  if (!messages) {
    return <BodySkeleton />;
  }

  return (
    <div className="relative flex size-full max-w-full flex-col overflow-hidden rounded-lg rounded-b-3xl border border-neutral-400/5 bg-neutral-600/10">
      <div className="absolute top-0 min-h-6 w-full bg-gradient-to-b from-[#1f1f1f]/80 to-[#1f1f1f]/0"></div>
      <Input channelId={channelId} />
      <div className="no-scrollbar flex h-full max-h-full w-full flex-col-reverse gap-[3px] overflow-y-scroll pb-[54px] pt-3">
        <p className="flex items-end justify-end pr-4 pt-0.5 text-xs font-medium text-neutral-400">
          {getLastMessageStatus()}
        </p>
        {messages.map((messageItem, i) => {
          const { message, isCurrentUser } = messageItem;
          return (
            <Message
              key={message._id}
              fromCurrentUser={isCurrentUser}
              position={getMessagePosition(i)}
              createdAt={message._creationTime}
              text={message.text}
            />
          );
        })}
      </div>
    </div>
  );
}
