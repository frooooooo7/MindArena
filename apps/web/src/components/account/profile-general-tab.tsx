"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User, UpdateProfileData } from "@mindarena/shared";
import { updateProfileSchema } from "@mindarena/shared";
import { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth.store";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/axios";

interface ProfileGeneralTabProps {
  user: User;
  onClose: () => void;
}

export function ProfileGeneralTab({ user, onClose }: ProfileGeneralTabProps) {
  const { updateUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
    },
  });

  const onSubmit = async (data: UpdateProfileData) => {
    if (data.name === user.name) {
      toast.info("No changes to save.");
      return;
    }

    try {
      const response = await api.patch("/users/profile", { name: data.name });
      updateUser(response.data.user);
      toast.success("Profile updated!");
      onClose();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.error || "Failed to update profile.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
      {/* Nickname */}
      <div className="space-y-2">
        <Label htmlFor="edit-nickname" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Nickname
        </Label>
        <Input
          id="edit-nickname"
          type="text"
          placeholder="Your display name"
          className="bg-white/[0.03] border-white/10 focus-visible:border-portal-mint focus-visible:ring-portal-mint/20 text-xs font-medium"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email (disabled) */}
      <div className="space-y-2">
        <Label htmlFor="edit-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Email Address
        </Label>
        <Input
          id="edit-email"
          type="email"
          value={user.email}
          disabled
          className="bg-white/[0.01] border-white/5 opacity-50 cursor-not-allowed text-xs font-medium"
        />
        <p className="text-[11px] text-muted-foreground">
          Email change is not available yet.
        </p>
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="flex items-center gap-2 px-5 py-2.5 bg-portal-mint hover:bg-portal-mint/90 disabled:opacity-40 text-[#07150f] rounded-xl text-xs font-extrabold shadow-[0_0_18px_rgba(112,245,193,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
