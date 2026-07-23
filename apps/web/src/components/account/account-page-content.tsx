"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BackgroundGradients, Footer } from "@/components/home";
import { Navbar } from "@/components/navbar";
import { ProfileHeader } from "@/components/account/profile-header";
import { LocalStatsSection } from "@/components/account/local-stats-section";
import { FriendStatsSection } from "@/components/account/friend-stats-section";
import { GameRecordsSection } from "@/components/account/game-records-section";
import { FriendsSection } from "@/components/account/friends-section";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { cn } from "@/lib/utils";

interface AccountPageContentProps {
  user: ProfileUser;
  isOwner: boolean;
}

const tabFade = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

export function AccountPageContent({ user, isOwner }: AccountPageContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [gameMode, setGameMode] = useState<GameMode>("local");
  const [isSendingFriendRequest, setIsSendingFriendRequest] = useState(false);
  const reduceMotion = Boolean(useReducedMotion());
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

  const motionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: "easeOut" as const };
  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 32 };

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

  const handleSelectLocalMode = () => {
    setGameMode("local");
  };

  const handleSelectArenaMode = () => {
    setGameMode("arena");
  };

  const handleMainTabChange = (value: string) => {
    if (!allowedTabs.includes(value)) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (value === "overview") {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const profileIsOnline = isFriendOnline(user.id);

  const mainTabTriggers = [
    { value: "overview", label: "Overview", icon: User },
    { value: "stats", label: "Statistics", icon: BarChart3 },
    ...(isOwner
      ? [
          { value: "social", label: "Social & Friends", icon: Users },
          { value: "security", label: "Security", icon: Shield },
        ]
      : []),
  ];

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

          <Tabs
            value={activeTab}
            onValueChange={handleMainTabChange}
            className="w-full space-y-6"
          >
            <TabsList className="bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 backdrop-blur-md inline-flex h-auto max-w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {mainTabTriggers.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;

                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={cn(
                      "relative z-10 gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-200",
                      "data-[state=active]:bg-transparent data-[state=active]:text-[#07150f] data-[state=active]:shadow-none",
                      !isActive && "text-muted-foreground",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId={
                          reduceMotion ? undefined : "account-main-tab-pill"
                        }
                        className="absolute inset-0 -z-10 rounded-xl bg-portal-mint shadow-[0_0_15px_rgba(112,245,193,0.3)]"
                        transition={pillTransition}
                      />
                    )}
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={reduceMotion ? false : tabFade.initial}
                animate={tabFade.animate}
                exit={reduceMotion ? tabFade.animate : tabFade.exit}
                transition={motionTransition}
              >
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div
                      className="relative flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10 w-fit"
                      role="tablist"
                      aria-label="Game mode"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={gameMode === "local"}
                        aria-label="Personal Practice"
                        tabIndex={0}
                        onClick={handleSelectLocalMode}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleSelectLocalMode();
                          }
                        }}
                        className={cn(
                          "relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-200",
                          gameMode === "local"
                            ? "text-[#07150f]"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {gameMode === "local" && (
                          <motion.span
                            layoutId={
                              reduceMotion ? undefined : "account-mode-pill"
                            }
                            className="absolute inset-0 -z-10 rounded-xl bg-portal-mint shadow-[0_0_15px_rgba(112,245,193,0.3)]"
                            transition={pillTransition}
                          />
                        )}
                        <Gamepad2 className="h-4 w-4" />
                        Personal Practice
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={gameMode === "arena"}
                        aria-label="Friend Duels"
                        tabIndex={0}
                        onClick={handleSelectArenaMode}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleSelectArenaMode();
                          }
                        }}
                        className={cn(
                          "relative z-10 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-200",
                          gameMode === "arena"
                            ? "text-[#07150f]"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {gameMode === "arena" && (
                          <motion.span
                            layoutId={
                              reduceMotion ? undefined : "account-mode-pill"
                            }
                            className="absolute inset-0 -z-10 rounded-xl bg-portal-mint shadow-[0_0_15px_rgba(112,245,193,0.3)]"
                            transition={pillTransition}
                          />
                        )}
                        <Swords className="h-4 w-4" />
                        Friend Duels
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={gameMode}
                        initial={reduceMotion ? false : tabFade.initial}
                        animate={tabFade.animate}
                        exit={reduceMotion ? tabFade.animate : tabFade.exit}
                        transition={motionTransition}
                      >
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
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}

                {activeTab === "stats" && (
                  <GameRecordsSection
                    isAuthenticated
                    profileName={targetProfileName}
                    isOwner={isOwner}
                  />
                )}

                {activeTab === "social" && isOwner && (
                  <FriendsSection isAuthenticated />
                )}

                {activeTab === "security" && isOwner && (
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
                          Add an extra layer of security to protect your MindArena
                          account.
                        </p>
                        <button
                          type="button"
                          className="mt-2 text-xs font-extrabold px-4 py-2 bg-portal-mint hover:bg-portal-mint/90 text-[#07150f] rounded-xl transition-all shadow-[0_0_15px_rgba(112,245,193,0.3)]"
                        >
                          Enable 2FA
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                        <p className="text-xs font-bold text-foreground">
                          Active Device Sessions
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Currently logged in on this browser session.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </main>

      <DuelFriendPicker />
      <Footer />
    </div>
  );
}
