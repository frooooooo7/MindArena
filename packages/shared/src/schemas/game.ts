import { z } from "zod";
import { GAME_TYPE_IDS, GAME_MODES } from "../types/game";

/**
 * Schema for validating game results.
 * Shared between backend (controller) and frontend (API/Forms).
 */
export const saveGameResultSchema = z.object({
  gameType: z.enum(GAME_TYPE_IDS),
  score: z.number().int().min(0),
  level: z.number().int().min(1),
  duration: z.number().int().min(0),
  mode: z.enum(GAME_MODES),
});

export type SaveGameResultSchema = z.infer<typeof saveGameResultSchema>;
