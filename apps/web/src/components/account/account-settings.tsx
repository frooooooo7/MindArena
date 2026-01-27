"use client";

import { User as UserType } from "@mindarena/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Settings, Save } from "lucide-react";

interface AccountSettingsProps {
    user: UserType;
}

export function AccountSettings({ user }: AccountSettingsProps) {
    const { register, handleSubmit } = useForm({
        defaultValues: {
            name: user.name,
            email: user.email,
        }
    });

    const onSubmit = (data: any) => {
        console.log("Update settings", data);
        // Implement logic to update user data
    };

    return (
        <div className="p-6 rounded-2xl border border-border/40 bg-card/60 h-fit">
            <div className="flex items-center gap-2 mb-6">
                <Settings className="h-5 w-5 text-violet-500" />
                <h3 className="text-xl font-bold">Profile Info</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="account-name">Public Name</Label>
                    <Input id="account-name" {...register("name")} className="bg-secondary/20" />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="account-email">Email Address</Label>
                    <Input id="account-email" {...register("email")} type="email" disabled className="bg-secondary/10 opacity-60 cursor-not-allowed" />
                    <p className="text-[10px] text-muted-foreground">Email change is currently disabled for security reasons.</p>
                </div>

                <div className="pt-4">
                    <Button type="submit" className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600">
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
