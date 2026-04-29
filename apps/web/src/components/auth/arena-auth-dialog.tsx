"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AuthTabs, TabContent } from "./auth-tabs";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { SocialAuth } from "./social-auth";

interface ArenaAuthDialogProps {
  open: boolean;
}

export function ArenaAuthDialog({ open }: ArenaAuthDialogProps) {
  const router = useRouter();

  const handleClose = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        handleClose();
      }
    },
    [handleClose]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100vh-2rem)] overflow-y-auto border-violet-500/20 bg-background/95 shadow-2xl shadow-violet-500/10 backdrop-blur-xl sm:max-w-md"
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close login and go to home page"
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-background"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-black tracking-tight">
            Sign in to enter the arena
          </DialogTitle>
          <DialogDescription>
            Arena battles are available only for logged-in players.
          </DialogDescription>
        </DialogHeader>

        <AuthTabs defaultTab="login">
          <TabContent value="login">
            <LoginForm redirectTo={null} />
            <SocialAuth />
          </TabContent>
          <TabContent value="register">
            <RegisterForm redirectTo={null} />
            <SocialAuth />
          </TabContent>
        </AuthTabs>
      </DialogContent>
    </Dialog>
  );
}
