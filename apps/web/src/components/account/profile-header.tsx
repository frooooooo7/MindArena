"use client";

import { User } from "@mindarena/shared";
import {
  Calendar,
  Mail,
  Edit3,
  UserPlus,
  UserCheck,
  Clock,
  Loader2,
  Swords,
  Trophy,
} from "lucide-react";
import { UserAvatar } from "../../components/ui/user-avatar";
import { EditProfileDialog } from "./edit-profile-dialog";
import { useState } from "react";

interface ProfileHeaderProps {
  user: User;
  isOwner?: boolean;
  onAddFriend?: () => void;
  isAddingFriend?: boolean;
  isFriend?: boolean;
  isFriendRequestSent?: boolean;
  hasPendingIncomingRequest?: boolean;
  onChallenge?: () => void;
  isFriendOnline?: boolean;
}

export function ProfileHeader({
  user,
  isOwner = true,
  onAddFriend,
  isAddingFriend = false,
  isFriend = false,
  isFriendRequestSent = false,
  hasPendingIncomingRequest = false,
  onChallenge,
  isFriendOnline = false,
}: ProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <div className="relative p-6 md:p-8 rounded-3xl border border-border/40 bg-card/60 overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-64 w-64 bg-violet-600/10 rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center md:items-center gap-6 relative">
        {/* Avatar with Overlay Trigger */}
        <div
          className={`relative inline-block rounded-full shrink-0 ${isOwner ? "group cursor-pointer" : ""}`}
          onClick={() => {
            if (isOwner) {
              setIsEditDialogOpen(true);
            }
          }}
        >
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="3xl" />

          {isOwner && (
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
              <Edit3 className="w-6 h-6 text-white mb-1" />
              <span className="text-xs font-medium text-white shadow-sm">
                Change
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-3 pb-2">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">{user.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
              {isOwner && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Joined{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Profile Header Badges: Friend Duelist & Personal High Score */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-linear-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/30 text-cyan-400 font-bold text-xs shadow-md shadow-cyan-500/10">
              <Swords className="h-4 w-4" />
              <span className="uppercase tracking-wider">Friend Duelist</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-linear-to-r from-violet-500/15 to-purple-500/15 border border-violet-500/30 text-violet-300 font-bold text-xs shadow-md shadow-violet-500/10">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>{user.rankPoints ? user.rankPoints.toLocaleString() : 0} Score Pts</span>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        {isOwner && (
          <button
            onClick={() => setIsEditDialogOpen(true)}
            className="absolute top-0 right-0 md:relative md:top-auto md:right-auto md:self-end px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-sm font-semibold border border-border/40"
          >
            Edit Profile
          </button>
        )}

        {!isOwner && onAddFriend && (
          <div className="absolute bottom-0 right-0 md:relative md:bottom-auto md:right-auto md:self-end flex flex-col gap-2">
            <button
              onClick={onAddFriend}
              disabled={
                isAddingFriend ||
                isFriend ||
                isFriendRequestSent ||
                hasPendingIncomingRequest
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-linear-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isAddingFriend ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isFriend ? (
                <UserCheck className="h-4 w-4" />
              ) : hasPendingIncomingRequest ? (
                <Clock className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {isFriend
                ? "Already friends"
                : hasPendingIncomingRequest
                  ? "Pending request"
                  : isFriendRequestSent
                    ? "Request sent"
                    : "Add to friends"}
            </button>
            {isFriend && onChallenge && (
              <button
                onClick={onChallenge}
                disabled={!isFriendOnline}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-linear-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title={
                  isFriendOnline ? "Challenge to a duel" : "Player is offline"
                }
              >
                <Swords className="h-4 w-4" />
                {isFriendOnline ? "Challenge" : "Offline"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      {isOwner && (
        <EditProfileDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          user={user}
        />
      )}
    </div>
  );
}
