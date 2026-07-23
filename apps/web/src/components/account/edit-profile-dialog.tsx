"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User } from "@mindarena/shared";
import { UserCircle, Camera, Shield } from "lucide-react";
import { ProfileGeneralTab } from "./profile-general-tab";
import { ProfileAvatarTab } from "./profile-avatar-tab";
import { ProfileSecurityTab } from "./profile-security-tab";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function EditProfileDialog({ open, onOpenChange, user }: EditProfileDialogProps) {
  const [resetKey, setResetKey] = useState(0);

  const handleOpenChange = (val: boolean) => {
    if (!val) setResetKey((k) => k + 1);
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-xl border border-portal-mint/30 shadow-2xl overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
            Edit <span className="text-portal-mint">Profile</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Manage your account settings and profile picture.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/[0.03] border border-white/10 rounded-2xl p-1">
            <TabsTrigger
              value="general"
              className="gap-1.5 text-xs font-bold rounded-xl data-[state=active]:bg-portal-mint data-[state=active]:text-[#07150f] data-[state=active]:shadow-[0_0_12px_rgba(112,245,193,0.3)] transition-all"
            >
              <UserCircle className="h-3.5 w-3.5" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger
              value="avatar"
              className="gap-1.5 text-xs font-bold rounded-xl data-[state=active]:bg-portal-mint data-[state=active]:text-[#07150f] data-[state=active]:shadow-[0_0_12px_rgba(112,245,193,0.3)] transition-all"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Avatar</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="gap-1.5 text-xs font-bold rounded-xl data-[state=active]:bg-portal-mint data-[state=active]:text-[#07150f] data-[state=active]:shadow-[0_0_12px_rgba(112,245,193,0.3)] transition-all"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <ProfileGeneralTab key={resetKey} user={user} onClose={() => onOpenChange(false)} />
          </TabsContent>

          <TabsContent value="avatar">
            <ProfileAvatarTab key={resetKey} user={user} />
          </TabsContent>

          <TabsContent value="security">
            <ProfileSecurityTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
