import { create } from "zustand";
import { DuelInvitation } from "@mindarena/shared";

interface DuelState {
  // Pending invitations received from other players
  pendingInvitations: DuelInvitation[];
  // Invitation we sent (confirmation)
  sentInvitation: DuelInvitation | null;
  // Online friend IDs (for presence awareness)
  onlineFriendIds: Set<string>;
  // Friend picker modal state
  isPickerOpen: boolean;
  preselectedFriendId: string | null;

  // Actions
  addInvitation: (invitation: DuelInvitation) => void;
  removeInvitation: (invitationId: string) => void;
  setSentInvitation: (invitation: DuelInvitation | null) => void;
  setOnlineFriendIds: (ids: string[]) => void;
  addOnlineFriend: (friendId: string) => void;
  removeOnlineFriend: (friendId: string) => void;
  setPickerOpen: (open: boolean, preselectedFriendId?: string) => void;
  reset: () => void;
}

export const useDuelStore = create<DuelState>((set) => ({
  pendingInvitations: [],
  sentInvitation: null,
  onlineFriendIds: new Set(),
  isPickerOpen: false,
  preselectedFriendId: null,

  addInvitation: (invitation) =>
    set((state) => {
      // Prevent duplicates
      if (state.pendingInvitations.some((i) => i.id === invitation.id)) {
        return state;
      }
      return {
        pendingInvitations: [...state.pendingInvitations, invitation],
      };
    }),

  removeInvitation: (invitationId) =>
    set((state) => ({
      pendingInvitations: state.pendingInvitations.filter(
        (i) => i.id !== invitationId,
      ),
      sentInvitation:
        state.sentInvitation?.id === invitationId ? null : state.sentInvitation,
    })),

  setSentInvitation: (invitation) => set({ sentInvitation: invitation }),

  setOnlineFriendIds: (ids) => set({ onlineFriendIds: new Set(ids) }),

  addOnlineFriend: (friendId) =>
    set((state) => {
      const updated = new Set(state.onlineFriendIds);
      updated.add(friendId);
      return { onlineFriendIds: updated };
    }),

  removeOnlineFriend: (friendId) =>
    set((state) => {
      const updated = new Set(state.onlineFriendIds);
      updated.delete(friendId);
      return { onlineFriendIds: updated };
    }),

  setPickerOpen: (open, preselectedFriendId) =>
    set({
      isPickerOpen: open,
      preselectedFriendId: open ? (preselectedFriendId ?? null) : null,
    }),

  reset: () =>
    set({
      pendingInvitations: [],
      sentInvitation: null,
      onlineFriendIds: new Set(),
      isPickerOpen: false,
      preselectedFriendId: null,
    }),
}));
