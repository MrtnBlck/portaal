import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const shareProject = mutation({
  args: {
    name: v.string(),
    templateOwnerId: v.string(),
    projectId: v.number(),
    message: v.string(),
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

    const templateOwnerUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.templateOwnerId))
      .unique();

    if (!templateOwnerUser) {
      throw new ConvexError("Template owner user not found");
    }

    if (templateOwnerUser._id === currentUser._id) {
      throw new ConvexError(
        "Cannot create a channel with yourself as the template owner",
      );
    }

    const projectChannelExists = await ctx.db
      .query("channels")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .first();

    if (projectChannelExists) {
      await ctx.db.insert("messages", {
        senderId: currentUser._id,
        channelId: projectChannelExists._id,
        text: args.message,
      });
      return;
    }

    const generalChannels = await ctx.db
      .query("channels")
      .withIndex("by_name", (q) => q.eq("name", "General"))
      .collect();

    const generalChannelMembers = await Promise.all(
      generalChannels.map(async (channel) => {
        const members = await ctx.db
          .query("channelMembers")
          .withIndex("by_channelId", (q) => q.eq("channelId", channel._id))
          .collect();
        return [...members.map((m) => m.memberId)];
      }),
    );

    const generalChannelExists = generalChannelMembers.some((channel) => {
      return (
        channel.includes(currentUser._id) &&
        channel.includes(templateOwnerUser._id)
      );
    });

    if (!generalChannelExists) {
      const generalChannelId = await ctx.db.insert("channels", {
        name: "General",
        project: false,
      });

      await ctx.db.insert("channelMembers", {
        memberId: currentUser._id,
        channelId: generalChannelId,
      });

      await ctx.db.insert("channelMembers", {
        memberId: templateOwnerUser._id,
        channelId: generalChannelId,
      });
    }

    const channelId = await ctx.db.insert("channels", {
      name: args.name,
      project: true,
      projectId: args.projectId,
    });

    await ctx.db.insert("channelMembers", {
      memberId: currentUser._id,
      channelId: channelId,
    });

    await ctx.db.insert("channelMembers", {
      memberId: templateOwnerUser._id,
      channelId: channelId,
    });

    await ctx.db.insert("messages", {
      senderId: currentUser._id,
      channelId: channelId,
      text: args.message,
    });
  },
});

export const get = query({
  args: {
    id: v.id("channels"),
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

    const channel = await ctx.db.get(args.id);

    if (!channel) {
      throw new ConvexError("Channel not found");
    }

    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_memberId_channelId", (q) =>
        q.eq("memberId", currentUser._id).eq("channelId", channel._id),
      )
      .unique();

    if (!membership) {
      throw new ConvexError("You are not a member of this channel");
    }

    const allChannelMemberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_channelId", (q) => q.eq("channelId", channel._id))
      .collect();

    const otherMember = allChannelMemberships.find(
      (membership) => membership.memberId !== currentUser._id,
    );

    if (!otherMember) {
      throw new ConvexError("No other members found in this channel");
    }

    const otherMemberDetails = await ctx.db.get(otherMember.memberId);

    return {
      ...channel,
      otherMember: {
        ...otherMemberDetails,
        lastSeenMessageId: otherMember.lastSeenMessage,
      },
    };
  },
});

export const getMostRecent = query({
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

    const memberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_memberId", (q) => q.eq("memberId", currentUser._id))
      .collect();

    if (memberships.length === 0) {
      return null;
    }

    if (memberships.length === 1 && memberships[0]) {
      return memberships[0].channelId;
    }

    const mostRecentMembership = memberships.reduce((prev, current) => {
      return (prev.lastOpened ?? 0) > (current.lastOpened ?? 0)
        ? prev
        : current;
    });

    return mostRecentMembership.channelId;
  },
});

export const updateLastOpened = mutation({
  args: {
    id: v.id("channels"),
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
        q.eq("memberId", currentUser._id).eq("channelId", args.id),
      )
      .unique();

    if (!membership) {
      throw new ConvexError("You are not a member of this channel");
    }

    await ctx.db.patch(membership._id, { lastOpened: Date.now() });
  },
});

export const updateLastSeenMessage = mutation({
  args: {
    channelId: v.id("channels"),
    messageId: v.id("messages"),
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

    if (membership.lastSeenMessage === args.messageId) {
      return;
    }

    await ctx.db.patch(membership._id, { lastSeenMessage: args.messageId });
  },
});

export const getLastSeenMessageId = query({
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

    const channelMemberships = await ctx.db
      .query("channelMembers")
      .withIndex("by_channelId", (q) => q.eq("channelId", args.channelId))
      .collect();

    const otherMembership = channelMemberships.find(
      (membership) => membership.memberId !== currentUser._id,
    );

    if (!otherMembership) {
      throw new ConvexError("No other member found in this channel");
    }

    return otherMembership.lastSeenMessage;
  },
});
