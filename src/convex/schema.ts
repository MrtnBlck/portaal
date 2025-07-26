import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    email: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_clerkId", ["clerkId"]),

  channels: defineTable({
    name: v.string(),
    project: v.boolean(),
    projectId: v.optional(v.number()),
  })
    .index("by_projectId", ["projectId"])
    .index("by_name", ["name"]),

  channelMembers: defineTable({
    memberId: v.id("users"),
    channelId: v.id("channels"),
    lastSeenMessage: v.optional(v.id("messages")),
    lastOpened: v.optional(v.number()),
  })
    .index("by_memberId", ["memberId"])
    .index("by_channelId", ["channelId"])
    .index("by_memberId_channelId", ["memberId", "channelId"]),

  messages: defineTable({
    senderId: v.id("users"),
    channelId: v.id("channels"),
    text: v.string(),
  }).index("by_channelId", ["channelId"]),
});
