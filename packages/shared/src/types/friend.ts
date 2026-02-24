import { z } from "zod";
import type { 
  SearchPlayersSchema, 
  SendFriendRequestSchema, 
  RespondFriendRequestSchema 
} from "../schemas/friend.schema";

export type SearchPlayersInput = z.infer<typeof SearchPlayersSchema>;
export type SendFriendRequestInput = z.infer<typeof SendFriendRequestSchema>;
export type RespondFriendRequestInput = z.infer<typeof RespondFriendRequestSchema>;

export type FriendStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface FriendUserDTO {
  id: string;
  name: string;
  rankName: string;
  rankPoints: number;
}

export interface FriendshipDTO {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendStatus;
  createdAt: string; 
  friend?: FriendUserDTO;
}

export interface SearchPlayersResponse {
  users: FriendUserDTO[];
  page: number;
  totalPages: number;
  totalCount: number;
}
