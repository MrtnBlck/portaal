import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const get = query({
  args: {
    channelId: v.id("channels"),
  },
  handler: async (ctx, args) => {
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

    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_memberId_channelId", (q) =>
        q.eq("memberId", currentUser._id).eq("channelId", args.channelId),
      )
      .unique();

    if (!membership) {
      throw new ConvexError("You are not a member of this channel");
    }

    const currentUserMemberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_memberId", (q) => q.eq("memberId", currentUser._id))
      .collect();

    if (!currentUserMemberships) {
      throw new ConvexError("No channel memberships found");
    }

    const channelMemberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_channelId", (q) => q.eq("channelId", args.channelId))
      .collect();

    const otherChannelMembership = channelMemberships.find(
      (member) => member.memberId !== currentUser._id,
    );

    if (!otherChannelMembership) {
      throw new ConvexError("No other members found in this channel");
    }

    const otherMember = await ctx.db.get(otherChannelMembership.memberId);

    if (!otherMember) {
      throw new ConvexError("Other member not found");
    }

    const otherChannelMemberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_memberId", (q) => q.eq("memberId", otherMember._id))
      .collect();

    if (!otherChannelMemberships) {
      throw new ConvexError("No channel memberships found for other member");
    }

    const commonChannels = currentUserMemberships.filter((membership) =>
      otherChannelMemberships.some(
        (otherMembership) => otherMembership.channelId === membership.channelId,
      ),
    );

    if (!commonChannels || commonChannels.length === 0) {
      throw new ConvexError("No common channels found");
    }

    const commonChannelDetails = await Promise.all(
      commonChannels.map(async (membership) => {
        const channel = await ctx.db.get(membership.channelId);
        if (!channel) {
          throw new ConvexError("Channel not found");
        }
        return {
          channelId: channel._id,
          name: channel.name,
          project: channel.project,
        };
      }),
    );

    const currentChannel = await ctx.db.get(args.channelId);

    if (!currentChannel) {
      throw new ConvexError("Channel not found");
    }

    return {
      username: otherMember.username,
      avatarUrl: otherMember.imageUrl,
      currentChannel: {
        name: currentChannel.name,
        id: currentChannel._id,
      },
      channels: commonChannelDetails,
    };
  },
});
