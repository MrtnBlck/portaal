import { ConvexError } from "convex/values";
import { getUserByClerkId } from "./_utils";
import { query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) {
      throw new ConvexError("Current user not found");
    }

    const channelMemberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_memberId", (q) => q.eq("memberId", currentUser._id))
      .collect();

    if (!channelMemberships || channelMemberships.length === 0) {
      throw new ConvexError("No channel memberships found");
    }

    const otherChannelMembers = await Promise.all(
      channelMemberships?.map(async (membership) => {
        const channelMembers = await ctx.db
          .query("channelMembers")
          .withIndex("by_channelId", (q) =>
            q.eq("channelId", membership.channelId),
          )
          .collect();
        const otherMembership = channelMembers.find(
          (member) => member.memberId !== currentUser._id,
        );

        if (!otherMembership) {
          throw new ConvexError("No other members found in this channel");
        }

        return {
          otherMemberId: otherMembership.memberId,
          channelInfo: {
            channelId: membership.channelId,
            lastOpened: membership.lastOpened,
            lastSeenMessageId: membership.lastSeenMessage,
          },
        };
      }),
    );

    const uniqueMembersMap = otherChannelMembers.reduce(
      (acc, { otherMemberId, channelInfo }) => {
        if (!acc[otherMemberId]) {
          acc[otherMemberId] = { otherMemberId, channels: [channelInfo] };
        } else {
          acc[otherMemberId].channels.push(channelInfo);
        }
        return acc;
      },
      {} as Record<
        string,
        {
          otherMemberId: Id<"users">;
          channels: {
            channelId: Id<"channels">;
            lastOpened: number | undefined;
            lastSeenMessageId: Id<"messages"> | undefined;
          }[];
        }
      >,
    );

    const uniqueMembersArray = Object.values(uniqueMembersMap);

    const conversations = await Promise.all(
      uniqueMembersArray.map(async (member) => {
        const otherMember = await ctx.db.get(member.otherMemberId);
        if (!otherMember) {
          throw new ConvexError("Other member not found");
        }

        const mostRecentMembership = member.channels.reduce((prev, current) => {
          return (prev.lastOpened ?? 0) > (current.lastOpened ?? 0)
            ? prev
            : current;
        });
        const channels = await Promise.all(
          member.channels.map(async (channel) => {
            const channelDetails = await ctx.db.get(channel.channelId);
            if (!channelDetails) {
              throw new ConvexError("Channel details not found");
            }

            const lastChannelMessage = await ctx.db
              .query("messages")
              .withIndex("by_channelId", (q) =>
                q.eq("channelId", channel.channelId),
              )
              .order("desc")
              .first();

            if (!lastChannelMessage) {
              return {
                channelId: channelDetails._id,
                name: channelDetails.name,
                project: channelDetails.project,
                lastMessageRead: true,
                lastMessageTime: 0,
              };
            }

            if (
              lastChannelMessage.senderId === currentUser._id ||
              lastChannelMessage._id === channel.lastSeenMessageId
            ) {
              return {
                channelId: channelDetails._id,
                name: channelDetails.name,
                project: channelDetails.project,
                lastMessageRead: true,
                lastMessageTime: lastChannelMessage._creationTime,
              };
            }

            return {
              channelId: channelDetails._id,
              name: channelDetails.name,
              project: channelDetails.project,
              lastMessageRead: false,
              lastMessageTime: lastChannelMessage._creationTime,
            };
          }),
        );

        return {
          username: otherMember.username,
          avatarUrl: otherMember.imageUrl,
          mostRecentChannel: mostRecentMembership.channelId,
          channels: channels,
        };
      }),
    );

    return conversations;
  },
});
