import type { Id } from "~/convex/_generated/dataModel";

type channel = {
  channelId: Id<"channels">;
  name: string;
  project: boolean;
  lastMessageRead: boolean;
  lastMessageTime: number;
};

export const useConversationsUtils = (channels: channel[]) => {
  const getConversationDetails = () => {
    const unreadChannelsCount = channels.filter(
      (channel) => !channel.lastMessageRead,
    ).length;
    if (unreadChannelsCount === 0) {
      return {
        text: "No new messages",
        seen: true,
      };
    } else if (unreadChannelsCount === 1) {
      const unreadChannel = channels.find(
        (channel) => !channel.lastMessageRead,
      );
      if (unreadChannel) {
        return {
          text: `New messages in ${unreadChannel.name}`,
          seen: false,
        };
      }
    }
    return {
      text: `${unreadChannelsCount} channels have new messages`,
      seen: false,
    };
  };

  const getTimeSinceLastMessage = () => {
    const lastMessageTime = channels.reduce((latest, channel) => {
      return channel.lastMessageTime > latest
        ? channel.lastMessageTime
        : latest;
    }, 0);
    if (lastMessageTime === 0) return "";
    const now = Date.now();
    const diff = now - lastMessageTime;

    // less than 1 minute
    if (diff < 60 * 1000) {
      return `${Math.floor(diff / 1000)}s`;
    }
    // less than 1 hour
    if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}m`;
    }
    // less than 1 day
    if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}h`;
    }
    // less than 1 week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d`;
    }
    // more than 1 week
    return `${Math.floor(diff / (7 * 24 * 60 * 60 * 1000))}w`;
  };

  return {
    getConversationDetails,
    getTimeSinceLastMessage,
  };
};
