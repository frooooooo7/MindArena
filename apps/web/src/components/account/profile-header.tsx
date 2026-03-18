"use client";

import {
  User,
  getRankForPoints,
  getRankProgress,
  getNextRankTier,
  RankName,
} from "@mindarena/shared";
import {
  Calendar,
  Mail,
  TrendingUp,
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

/** Color scheme per rank tier */
function getRankColors(rankName: string) {
  switch (rankName) {
    case "Geniusz":
      return {
        bg: "from-amber-500/15 to-yellow-500/15",
        border: "border-amber-500/30",
        text: "text-amber-400",
        bar: "from-amber-500 to-yellow-500",
        glow: "shadow-amber-500/20",
      };
    case "Kora":
      return {
        bg: "from-cyan-500/15 to-teal-500/15",
        border: "border-cyan-500/30",
        text: "text-cyan-400",
        bar: "from-cyan-500 to-teal-500",
        glow: "shadow-cyan-500/20",
      };
    case "Synapsa":
      return {
        bg: "from-violet-500/15 to-purple-500/15",
        border: "border-violet-500/30",
        text: "text-violet-400",
        bar: "from-violet-500 to-purple-500",
        glow: "shadow-violet-500/20",
      };
    default: // Neuron
      return {
        bg: "from-slate-500/15 to-zinc-500/15",
        border: "border-slate-500/30",
        text: "text-slate-400",
        bar: "from-slate-500 to-zinc-500",
        glow: "shadow-slate-500/20",
      };
  }
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
  const rank = getRankForPoints(user.rankPoints);
  const progress = getRankProgress(user.rankPoints);
  const nextRank = getNextRankTier(rank.name as RankName);
  const colors = getRankColors(rank.name);

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

          {/* Rank Badge + Progress */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            {/* Rank Badge */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl bg-linear-to-r ${colors.bg} border ${colors.border} ${colors.glow} shadow-lg`}
            >
              <span className="text-xl">{rank.icon}</span>
              <span
                className={`font-bold text-sm uppercase tracking-wider ${colors.text}`}
              >
                {rank.name}
              </span>
              <span className="text-xs text-muted-foreground font-semibold tabular-nums">
                {user.rankPoints} pts
              </span>
            </div>

            {/* Progress bar to next rank */}
            {nextRank && (
              <div className="flex items-center gap-2 flex-1 max-w-50">
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
                    <div
                      className={`h-full rounded-full bg-linear-to-r ${colors.bar} transition-all duration-700`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                  <TrendingUp className="h-3 w-3" />
                  <span>
                    {nextRank.icon} {nextRank.minPoints}
                  </span>
                </div>
              </div>
            )}

            {/* Max rank indicator */}
            {!nextRank && (
              <span className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider">
                Max Rank
              </span>
            )}
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
