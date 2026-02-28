"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { User as PublicUserProfileResponse } from "@mindarena/shared";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/lib/axios";
import { AccountPageContent } from "@/components/account/account-page-content";
import { BackgroundGradients } from "@/components/home";
import { Navbar } from "@/components/navbar";

export default function UserAccountProfilePage() {
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const router = useRouter();
  const params = useParams<{ name: string }>();
  const rawNameParam = Array.isArray(params?.name)
    ? params.name[0]
    : params?.name;

  const profileName = useMemo(() => {
    if (!rawNameParam) {
      return "";
    }

    try {
      return decodeURIComponent(rawNameParam);
    } catch {
      return rawNameParam;
    }
  }, [rawNameParam]);

  const [profileUser, setProfileUser] =
    useState<PublicUserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !profileName) {
      return;
    }

    if (user && user.name.toLowerCase() === profileName.toLowerCase()) {
      router.replace("/account");
      return;
    }

    let isCancelled = false;

    const loadProfile = async () => {
      setIsLoading(true);
      setIsNotFound(false);

      try {
        const response = await api.get<PublicUserProfileResponse>(
          `/users/profile/${encodeURIComponent(profileName)}`,
        );
        if (!isCancelled) {
          setProfileUser(response.data);
        }
      } catch (error: unknown) {
        if (isCancelled) {
          return;
        }

        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404) {
          setIsNotFound(true);
          setProfileUser(null);
        } else if (status === 401) {
          router.push("/auth");
        } else {
          setIsNotFound(true);
          setProfileUser(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, isHydrated, profileName, router]);

  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background">
        <BackgroundGradients />
        <Navbar />
        <main className="container relative mx-auto px-4 py-8 md:px-8 max-w-6xl">
          <div className="space-y-6 animate-pulse">
            <div className="h-10 w-64 rounded-xl bg-secondary/30" />
            <div className="h-48 rounded-3xl bg-secondary/20 border border-border/40" />
            <div className="h-80 rounded-2xl bg-secondary/20 border border-border/40" />
          </div>
        </main>
      </div>
    );
  }

  if (isNotFound || !profileUser) {
    return (
      <div className="relative min-h-screen bg-background">
        <BackgroundGradients />
        <Navbar />
        <main className="container relative mx-auto px-4 py-8 md:px-8 max-w-6xl">
          <div className="p-12 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/5">
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              Profile not found
            </h1>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t find a player profile for &quot;{profileName}
              &quot;.
            </p>
            <button
              onClick={() => router.push("/account")}
              className="text-sm font-semibold px-4 py-2 rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 transition-colors"
            >
              Back to My Account
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isOwner = !!user && user.id === profileUser.id;

  return <AccountPageContent user={profileUser} isOwner={isOwner} />;
}
