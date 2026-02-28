"use client";

import { useEffect, useCallback, useRef } from "react";
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

export function useDuel() {
  const { isAuthenticated } = useAuthStore();
  const {
    pendingInvitations,
    sentInvitation,
    onlineFriendIds,
    isPickerOpen,
    addInvitation,
    removeInvitation,
    setSentInvitation,
    setOnlineFriendIds,
    addOnlineFriend,
    removeOnlineFriend,
    setPickerOpen,
  } = useDuelStore();

  // Use a ref to access sentInvitation inside event handlers without
  // re-registering all socket listeners whenever it changes.
  const sentInvitationRef = useRef(sentInvitation);
  sentInvitationRef.current = sentInvitation;

  useEffect(() => {
    if (!isAuthenticated) return;

    // Duel events
    const handleInviteReceived = (invitation: DuelInvitation) => {
      addInvitation(invitation);
    };

    const handleInviteSent = (invitation: DuelInvitation) => {
      setSentInvitation(invitation);
      toast.success(`Challenge sent to ${invitation.targetId}!`);
    };

    const handleDeclined = (data: { invitationId: string }) => {
      removeInvitation(data.invitationId);
      setSentInvitation(null);
      toast.info("Your challenge was declined.");
    };

    const handleCancelled = (data: {
      invitationId: string;
      reason: string;
    }) => {
      removeInvitation(data.invitationId);
      if (sentInvitationRef.current?.id === data.invitationId) {
        setSentInvitation(null);
      }
      if (data.reason === "inviter_offline") {
        toast.info("Challenge cancelled — player went offline.");
      } else if (data.reason === "target_offline") {
        toast.info("Challenge cancelled — opponent went offline.");
      }
    };

    const handleExpired = (data: { invitationId: string }) => {
      removeInvitation(data.invitationId);
      if (sentInvitationRef.current?.id === data.invitationId) {
        setSentInvitation(null);
        toast.info("Your challenge expired.");
      }
    };

    const handleError = (data: { message: string }) => {
      toast.error(data.message);
    };

    // Presence events
    const handleFriendsOnline = (data: { friendIds: string[] }) => {
      setOnlineFriendIds(data.friendIds);
    };

    const handleFriendOnline = (data: { friendId: string }) => {
      addOnlineFriend(data.friendId);
    };

    const handleFriendOffline = (data: { friendId: string }) => {
      removeOnlineFriend(data.friendId);
    };

    // Register listeners
    socket.on(DUEL_EVENTS.INVITE_RECEIVED, handleInviteReceived);
    socket.on(DUEL_EVENTS.INVITE_SENT, handleInviteSent);
    socket.on(DUEL_EVENTS.DECLINE, handleDeclined);
    socket.on(DUEL_EVENTS.CANCELLED, handleCancelled);
    socket.on(DUEL_EVENTS.EXPIRED, handleExpired);
    socket.on(DUEL_EVENTS.ERROR, handleError);
    socket.on(PRESENCE_EVENTS.FRIENDS_ONLINE, handleFriendsOnline);
    socket.on(PRESENCE_EVENTS.FRIEND_ONLINE, handleFriendOnline);
    socket.on(PRESENCE_EVENTS.FRIEND_OFFLINE, handleFriendOffline);

    return () => {
      socket.off(DUEL_EVENTS.INVITE_RECEIVED, handleInviteReceived);
      socket.off(DUEL_EVENTS.INVITE_SENT, handleInviteSent);
      socket.off(DUEL_EVENTS.DECLINE, handleDeclined);
      socket.off(DUEL_EVENTS.CANCELLED, handleCancelled);
      socket.off(DUEL_EVENTS.EXPIRED, handleExpired);
      socket.off(DUEL_EVENTS.ERROR, handleError);
      socket.off(PRESENCE_EVENTS.FRIENDS_ONLINE, handleFriendsOnline);
      socket.off(PRESENCE_EVENTS.FRIEND_ONLINE, handleFriendOnline);
      socket.off(PRESENCE_EVENTS.FRIEND_OFFLINE, handleFriendOffline);
    };
  }, [
    isAuthenticated,
    addInvitation,
    removeInvitation,
    setSentInvitation,
    setOnlineFriendIds,
    addOnlineFriend,
    removeOnlineFriend,
  ]);

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
    sendInvite,
    acceptInvite,
    declineInvite,
    isFriendOnline,
    setPickerOpen,
  };
}
