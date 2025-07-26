import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { getUserByClerkId } from "./_utils";

export const create = mutation({
  args: {
    channelId: v.id("channels"),
    text: v.string(),
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

    const message = await ctx.db.insert("messages", {
      senderId: currentUser._id,
      ...args,
    });

    return message;
  },
});
