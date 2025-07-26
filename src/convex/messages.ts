import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

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

    const membership = await ctx.db
      .query("channelMembers")
      .withIndex("by_memberId_channelId", (q) =>
        q.eq("memberId", currentUser._id).eq("channelId", args.id),
      )
      .unique();

    if (!membership) {
      throw new ConvexError("You are not a member of this channel");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channelId", (q) => q.eq("channelId", args.id))
      .order("desc")
      .collect();

    const messagesWithUsers = await Promise.all(
      messages.map(async (message) => {
        const messageSender = await ctx.db.get(message.senderId);
        if (!messageSender) {
          throw new ConvexError("Message sender not found");
        }

        return {
          message,
          isCurrentUser: messageSender._id === currentUser._id,
        };
      }),
    );

    return messagesWithUsers;
  },
});
