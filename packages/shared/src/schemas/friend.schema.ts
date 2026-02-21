import { z } from "zod";

export const SearchPlayersSchema = z.object({
  query: z.string().min(3, "Query must be at least 3 characters").max(50),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(20).default(10),
});

export const SendFriendRequestSchema = z.object({
  targetUserId: z.string().cuid("Invalid user ID"),
});

export const RespondFriendRequestSchema = z.object({
  accept: z.boolean(),
});
