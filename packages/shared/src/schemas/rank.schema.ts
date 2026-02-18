/**
 * Rank Validation Schemas
 *
 * Zod schemas for runtime validation of rank-related data
 * flowing through Socket.IO events.
 */
import { z } from "zod";
import { RANK_TIERS } from "../game/mind-rank";

// Valid rank names derived from the source of truth
const rankNames = RANK_TIERS.map((t) => t.name);

export const rankNameSchema = z.enum(
  rankNames as [string, ...string[]],
);

/**
 * Schema for the RankUpdatePayload sent via ARENA_EVENTS.RANK_UPDATED
 */
export const rankUpdatePayloadSchema = z.object({
  playerId: z.string().min(1, "Player ID is required"),
  oldPoints: z.number().int().min(0),
  currentPoints: z.number().int().min(0),
  pointsDelta: z.number().int(),
  rankName: rankNameSchema,
  rankIcon: z.string().min(1),
  isPromotion: z.boolean(),
  isDemotion: z.boolean(),
});

export type RankUpdatePayloadValidated = z.infer<typeof rankUpdatePayloadSchema>;
