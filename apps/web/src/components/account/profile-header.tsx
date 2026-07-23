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
    <div className="relative p-6 md:p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden group">
      {/* Background Radial Glow in Logo Mint */}
      <div className="portal-dot-grid absolute inset-0 opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 h-72 w-72 bg-portal-mint/15 rounded-full blur-3xl pointer-events-none group-hover:bg-portal-mint/20 transition-colors duration-500" />

      <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          {/* Avatar with Ring & Edit Overlay */}
          <div
            className={`relative inline-block rounded-full shrink-0 ring-4 ring-portal-mint/30 p-1 shadow-[0_0_20px_rgba(112,245,193,0.15)] ${
              isOwner ? "group/avatar cursor-pointer" : ""
            }`}
            onClick={() => {
              if (isOwner) {
                setIsEditDialogOpen(true);
              }
            }}
          >
            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="3xl" />

            {isOwner && (
              <div className="absolute inset-1 rounded-full bg-black/65 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                <Edit3 className="w-6 h-6 mb-1 text-portal-mint" />
                <span className="text-[11px] font-bold tracking-wider text-portal-mint">Edit Avatar</span>
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-foreground">
              {user.name}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-medium text-muted-foreground">
              {isOwner && user.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-portal-mint" />
                  <span>{user.email}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-portal-mint" />
                <span>
                  Member since{" "}
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons in Logo Mint styling */}
        {isOwner ? (
          <button
            type="button"
            onClick={() => setIsEditDialogOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-portal-mint text-[#07150f] font-extrabold text-xs transition-all hover:bg-portal-mint/90 hover:shadow-[0_0_20px_rgba(112,245,193,0.35)] flex items-center gap-2"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Profile
          </button>
        ) : (
          onAddFriend && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onAddFriend}
                disabled={
                  isAddingFriend ||
                  isFriend ||
                  isFriendRequestSent ||
                  hasPendingIncomingRequest
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-portal-mint text-[#07150f] hover:bg-portal-mint/90 hover:shadow-[0_0_20px_rgba(112,245,193,0.35)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
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
                  ? "Friends"
                  : hasPendingIncomingRequest
                    ? "Pending Request"
                    : isFriendRequestSent
                      ? "Request Sent"
                      : "Add Friend"}
              </button>

              {isFriend && onChallenge && (
                <button
                  type="button"
                  onClick={onChallenge}
                  disabled={!isFriendOnline}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-white/10 border border-white/15 text-foreground hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title={
                    isFriendOnline ? "Challenge to a duel" : "Player is offline"
                  }
                >
                  <Swords className="h-4 w-4 text-portal-mint" />
                  {isFriendOnline ? "Challenge Duel" : "Offline"}
                </button>
              )}
            </div>
          )
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
