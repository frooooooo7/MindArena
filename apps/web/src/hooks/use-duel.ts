"use client";

import { useEffect, useCallback } from "react";
import { socket } from "@/lib/socket";
import { useDuelStore } from "@/store/duel.store";
import { useAuthStore } from "@/store/auth.store";
import {
  DuelInvitation,
  DUEL_EVENTS,
  PRESENCE_EVENTS,
  SendDuelInvitePayload,
} from "@mindarena/shared";
import { toast } from "sonner";

let duelListenerSubscribers = 0;

const handleInviteReceived = (invitation: DuelInvitation) => {
  useDuelStore.getState().addInvitation(invitation);
};

const handleInviteSent = (invitation: DuelInvitation) => {
  useDuelStore.getState().setSentInvitation(invitation);
  toast.success("Challenge sent!");
};

const handleDeclined = (data: { invitationId: string }) => {
  const store = useDuelStore.getState();
  store.removeInvitation(data.invitationId);
  store.setSentInvitation(null);
  toast.info("Your challenge was declined.");
};

const handleCancelled = (data: { invitationId: string; reason: string }) => {
  const store = useDuelStore.getState();
  store.removeInvitation(data.invitationId);
  if (store.sentInvitation?.id === data.invitationId) {
    store.setSentInvitation(null);
  }
  if (data.reason === "inviter_offline") {
    toast.info("Challenge cancelled — player went offline.");
  } else if (data.reason === "target_offline") {
    toast.info("Challenge cancelled — opponent went offline.");
  }
};

const handleExpired = (data: { invitationId: string }) => {
  const store = useDuelStore.getState();
  store.removeInvitation(data.invitationId);
  if (store.sentInvitation?.id === data.invitationId) {
    store.setSentInvitation(null);
    toast.info("Your challenge expired.");
  }
};

const handleError = (data: { message: string }) => {
  useDuelStore.getState().setSentInvitation(null);
  toast.error(data.message);
};

const handleFriendsOnline = (data: { friendIds: string[] }) => {
  useDuelStore.getState().setOnlineFriendIds(data.friendIds);
};

const handleFriendOnline = (data: { friendId: string }) => {
  useDuelStore.getState().addOnlineFriend(data.friendId);
};

const handleFriendOffline = (data: { friendId: string }) => {
  useDuelStore.getState().removeOnlineFriend(data.friendId);
};

function registerDuelSocketListeners() {
  socket.on(DUEL_EVENTS.INVITE_RECEIVED, handleInviteReceived);
  socket.on(DUEL_EVENTS.INVITE_SENT, handleInviteSent);
  socket.on(DUEL_EVENTS.DECLINE, handleDeclined);
  socket.on(DUEL_EVENTS.CANCELLED, handleCancelled);
  socket.on(DUEL_EVENTS.EXPIRED, handleExpired);
  socket.on(DUEL_EVENTS.ERROR, handleError);
  socket.on(PRESENCE_EVENTS.FRIENDS_ONLINE, handleFriendsOnline);
  socket.on(PRESENCE_EVENTS.FRIEND_ONLINE, handleFriendOnline);
  socket.on(PRESENCE_EVENTS.FRIEND_OFFLINE, handleFriendOffline);
}

function unregisterDuelSocketListeners() {
  socket.off(DUEL_EVENTS.INVITE_RECEIVED, handleInviteReceived);
  socket.off(DUEL_EVENTS.INVITE_SENT, handleInviteSent);
  socket.off(DUEL_EVENTS.DECLINE, handleDeclined);
  socket.off(DUEL_EVENTS.CANCELLED, handleCancelled);
  socket.off(DUEL_EVENTS.EXPIRED, handleExpired);
  socket.off(DUEL_EVENTS.ERROR, handleError);
  socket.off(PRESENCE_EVENTS.FRIENDS_ONLINE, handleFriendsOnline);
  socket.off(PRESENCE_EVENTS.FRIEND_ONLINE, handleFriendOnline);
  socket.off(PRESENCE_EVENTS.FRIEND_OFFLINE, handleFriendOffline);
}

export function useDuel() {
  const { isAuthenticated } = useAuthStore();
  const {
    pendingInvitations,
    sentInvitation,
    onlineFriendIds,
    isPickerOpen,
    preselectedFriendId,
    removeInvitation,
    setPickerOpen,
  } = useDuelStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    duelListenerSubscribers += 1;
    if (duelListenerSubscribers === 1) {
      registerDuelSocketListeners();
    }

    return () => {
      duelListenerSubscribers = Math.max(duelListenerSubscribers - 1, 0);
      if (duelListenerSubscribers === 0) {
        unregisterDuelSocketListeners();
      }
    };
  }, [isAuthenticated]);

  const sendInvite = useCallback((payload: SendDuelInvitePayload) => {
    if (!socket.connected) {
      toast.error("Not connected to server");
      return;
    }
    socket.emit(DUEL_EVENTS.SEND_INVITE, payload);
  }, []);

  const acceptInvite = useCallback(
    (invitationId: string) => {
      if (!socket.connected) {
        toast.error("Not connected to server");
        return;
      }
      socket.emit(DUEL_EVENTS.ACCEPT, { invitationId });
      removeInvitation(invitationId);
    },
    [removeInvitation],
  );

  const declineInvite = useCallback(
    (invitationId: string) => {
      if (!socket.connected) {
        toast.error("Not connected to server");
        return;
      }
      socket.emit(DUEL_EVENTS.DECLINE, { invitationId });
      removeInvitation(invitationId);
    },
    [removeInvitation],
  );

  const isFriendOnline = useCallback(
    (friendId: string) => onlineFriendIds.has(friendId),
    [onlineFriendIds],
  );

  return {
    pendingInvitations,
    sentInvitation,
    onlineFriendIds,
    isPickerOpen,
    preselectedFriendId,
    sendInvite,
    acceptInvite,
    declineInvite,
    isFriendOnline,
    setPickerOpen,
  };
}
