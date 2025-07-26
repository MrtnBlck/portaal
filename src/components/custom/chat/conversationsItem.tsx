import type { Id } from "~/convex/_generated/dataModel";
import { User } from "lucide-react";
import Link from "next/link";
import { useConversationsUtils } from "~/app/_hooks/chat/useConversationsUtils";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

type channel = {
  channelId: Id<"channels">;
  name: string;
  project: boolean;
  lastMessageRead: boolean;
  lastMessageTime: number;
};

export default function ConversationsItem(props: {
  avatarImageUrl?: string;
  username: string;
  channels: channel[];
  selected: boolean;
  channelId: string;
}) {
  const { avatarImageUrl, username, selected, channelId, channels } = props;
  const { getConversationDetails, getTimeSinceLastMessage } =
    useConversationsUtils(channels);

  const { text, seen } = getConversationDetails();

  return (
    <Link href={`/chat/${channelId}`}>
      <div
        className={cn(
          "flex w-full select-none flex-row items-center gap-2.5 overflow-hidden rounded-lg border border-neutral-400/5 bg-neutral-600/10 px-3.5 py-2.5",
          !selected && "hover:multi-[bg-neutral-600/15;border-neutral-600/15]",
          selected &&
            "border-neutral-600/50 shadow-[inset_0px_0px_4px_1px_rgba(255,_255,_255,_0.09)]",
        )}
      >
        <Avatar className="size-9">
          <AvatarImage src={avatarImageUrl ?? ""} />
          <AvatarFallback>
            <User className="size-5" />
          </AvatarFallback>
        </Avatar>
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex max-w-52 flex-col gap-1 overflow-hidden overflow-ellipsis whitespace-nowrap py-1">
            <span className="text-sm font-light leading-none text-neutral-100">
              {username}
            </span>
            <span
              className={cn(
                "flex truncate text-xs",
                seen ? "text-neutral-400" : "font-semibold text-neutral-100",
              )}
            >
              <p>{text}</p>
            </span>
          </div>
          <p
            className={cn(
              "text-sm text-neutral-400",
              !seen && "font-medium text-neutral-100",
            )}
          >
            {getTimeSinceLastMessage()}
          </p>
        </div>
      </div>
    </Link>
  );
}
