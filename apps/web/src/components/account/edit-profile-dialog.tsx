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
  // Increment key on close to force child components to remount and reset their state
  const [resetKey, setResetKey] = useState(0);

  const handleOpenChange = (val: boolean) => {
    if (!val) setResetKey((k) => k + 1);
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card/90 backdrop-blur-xl border-violet-500/20 shadow-2xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Manage your account settings and profile picture.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="general" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/15 data-[state=active]:to-indigo-600/15">
              <UserCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="avatar" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/15 data-[state=active]:to-indigo-600/15">
              <Camera className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Avatar</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/15 data-[state=active]:to-indigo-600/15">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Security</span>
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

