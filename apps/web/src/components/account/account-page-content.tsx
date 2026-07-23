"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { BackgroundGradients, Footer } from "@/components/home";
import { Navbar } from "@/components/navbar";
import { ProfileHeader } from "@/components/account/profile-header";
import { LocalStatsSection } from "@/components/account/local-stats-section";
import { FriendStatsSection } from "@/components/account/friend-stats-section";
import { GameRecordsSection } from "@/components/account/game-records-section";
import { FriendsSection } from "@/components/account/friends-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Shield,
  BarChart3,
  Gamepad2,
  Swords,
  Users,
} from "lucide-react";
import { GameMode, type User as ProfileUser } from "@mindarena/shared";
import { toast } from "sonner";
import { useFriends } from "@/hooks/use-friends";
import { useDuel } from "@/hooks/use-duel";
import { DuelFriendPicker } from "@/components/arena/duel-friend-picker";

interface AccountPageContentProps {
  user: ProfileUser;
  isOwner: boolean;
}

export function AccountPageContent({ user, isOwner }: AccountPageContentProps) {
  const searchParams = useSearchParams();
  const [gameMode, setGameMode] = useState<GameMode>("local");
  const [isSendingFriendRequest, setIsSendingFriendRequest] = useState(false);
  const { friends, pendingRequests, sendRequest } = useFriends();
  const { isFriendOnline, setPickerOpen } = useDuel();

  const ownerTabs = ["overview", "stats", "social", "security"];
  const publicTabs = ["overview", "stats"];
  const allowedTabs = isOwner ? ownerTabs : publicTabs;

  const tabFromQuery = searchParams.get("tab");
  const activeTab =
    tabFromQuery && allowedTabs.includes(tabFromQuery)
      ? tabFromQuery
      : "overview";

  const targetProfileName = isOwner ? undefined : user.name;
  const isAlreadyFriend = friends.some(
    (friendship) => friendship.friend?.id === user.id,
  );
  const isFriendRequestSent = pendingRequests.sent.some(
    (request) => request.friend?.id === user.id,
  );
  const hasPendingIncomingRequest = pendingRequests.received.some(
    (request) => request.friend?.id === user.id,
  );

  const handleAddToFriends = async () => {
    if (isAlreadyFriend || isFriendRequestSent || hasPendingIncomingRequest) {
      return;
    }

    try {
      setIsSendingFriendRequest(true);
      const success = await sendRequest(user.id);
      if (!success) {
        toast.error("Failed to send friend request");
        return;
      }
      toast.success(`Friend request sent to ${user.name}`);
    } finally {
      setIsSendingFriendRequest(false);
    }
  };

  const handleChallenge = () => {
    setPickerOpen(true, user.id);
  };

  const profileIsOnline = isFriendOnline(user.id);

  return (
    <div className="min-h-dvh bg-background flex flex-col justify-between relative overflow-hidden">
      <BackgroundGradients />
      <Navbar />

      <main className="container relative z-10 mx-auto px-4 py-8 md:px-8 max-w-6xl flex-1">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ProfileHeader
            user={user}
            isOwner={isOwner}
            onAddFriend={handleAddToFriends}
            isAddingFriend={isSendingFriendRequest}
            isFriend={isAlreadyFriend}
            isFriendRequestSent={isFriendRequestSent}
            hasPendingIncomingRequest={hasPendingIncomingRequest}
            onChallenge={handleChallenge}
            isFriendOnline={profileIsOnline}
          />

          <Tabs key={activeTab} defaultValue={activeTab} className="w-full space-y-6">
            <TabsList className="bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 backdrop-blur-md inline-flex h-auto max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <TabsTrigger
                value="overview"
                className="gap-2 px-4 py-2 rounded-xl text-xs font-bold data-[state=active]:bg-portal-mint data-[state=active]:text-[#07150f] data-[state=active]:shadow-[0_0_15px_rgba(112,245,193,0.3)] transition-all"
              >
                <User className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="gap-2 px-4 py-2 rounded-xl text-xs font-bold data-[state=active]:bg-portal-mint data-[state=active]:text-[#07150f] data-[state=active]:shadow-[0_0_15px_rgba(112,245,193,0.3)] transition-all"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Statistics</span>
              </TabsTrigger>
              {isOwner && (
                <TabsTrigger
                  value="social"
                  className="gap-2 px-4 py-2 rounded-xl text-xs font-bold data-[state=active]:bg-portal-mint data-[state=active]:text-[#07150f] data-[state=active]:shadow-[0_0_15px_rgba(112,245,193,0.3)] transition-all"
                >
                  <Users className="h-4 w-4" />
                  <span>Social & Friends</span>
                </TabsTrigger>
              )}
              {isOwner && (
                <TabsTrigger
                  value="security"
                  className="gap-2 px-4 py-2 rounded-xl text-xs font-bold data-[state=active]:bg-portal-mint data-[state=active]:text-[#07150f] data-[state=active]:shadow-[0_0_15px_rgba(112,245,193,0.3)] transition-all"
                >
                  <Shield className="h-4 w-4" />
                  <span>Security</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Mode Toggle Controls in Logo Mint */}
              <div className="flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 w-fit">
                <button
                  type="button"
                  onClick={() => setGameMode("local")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    gameMode === "local"
                      ? "bg-portal-mint text-[#07150f] shadow-[0_0_15px_rgba(112,245,193,0.3)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Gamepad2 className="h-4 w-4" />
                  Personal Practice
                </button>
                <button
                  type="button"
                  onClick={() => setGameMode("arena")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    gameMode === "arena"
                      ? "bg-portal-mint text-[#07150f] shadow-[0_0_15px_rgba(112,245,193,0.3)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Swords className="h-4 w-4" />
                  Friend Duels
                </button>
              </div>

              {gameMode === "local" ? (
                <LocalStatsSection
                  isAuthenticated
                  profileName={targetProfileName}
                />
              ) : (
                <FriendStatsSection
                  isAuthenticated
                  profileName={targetProfileName}
                />
              )}
            </TabsContent>

            <TabsContent value="stats">
              <GameRecordsSection
                isAuthenticated
                profileName={targetProfileName}
                isOwner={isOwner}
              />
            </TabsContent>

            {isOwner && (
              <TabsContent value="social">
                <FriendsSection isAuthenticated />
              </TabsContent>
            )}

            {isOwner && (
              <TabsContent value="security">
                <div className="max-w-xl p-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-xl space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <div className="p-2.5 rounded-2xl bg-portal-mint/15 border border-portal-mint/30 text-portal-mint">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base">
                        Security & Credentials
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Manage your authentication and password settings.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                      <p className="text-xs font-bold text-foreground">
                        Two-Factor Authentication (2FA)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Add an extra layer of security to protect your MindArena account.
                      </p>
                      <button
                        type="button"
                        className="mt-2 text-xs font-extrabold px-4 py-2 bg-portal-mint hover:bg-portal-mint/90 text-[#07150f] rounded-xl transition-all shadow-[0_0_15px_rgba(112,245,193,0.3)]"
                      >
                        Enable 2FA
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                      <p className="text-xs font-bold text-foreground">Active Device Sessions</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Currently logged in on this browser session.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      <DuelFriendPicker />
      <Footer />
    </div>
  );
}
