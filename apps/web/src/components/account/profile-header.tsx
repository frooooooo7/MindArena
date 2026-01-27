"use client";

import { User } from "@mindarena/shared";
import { Calendar, Mail, MapPin } from "lucide-react";

interface ProfileHeaderProps {
    user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
    return (
        <div className="relative p-6 md:p-8 rounded-3xl border border-border/40 bg-card/60 overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-64 w-64 bg-violet-600/10 rounded-full pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 relative">
                {/* Avatar */}
                <div className="relative">
                    <div className="h-24 w-24 md:h-32 md:w-32 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-600 p-1 shadow-2xl shadow-violet-500/20">
                        <div className="h-full w-full rounded-[20px] bg-card flex items-center justify-center overflow-hidden">
                             <span className="text-4xl md:text-5xl font-black bg-gradient-to-br from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                {user.name.charAt(0).toUpperCase()}
                             </span>
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left space-y-3 pb-2">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight">{user.name}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Mail className="h-4 w-4" />
                                {user.email}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                Earth
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center md:justify-start gap-2 pt-2">
                         <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 text-xs font-bold border border-violet-500/20 uppercase tracking-wider">
                            Grandmaster
                         </span>
                         <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 uppercase tracking-wider">
                            Verified
                         </span>
                    </div>
                </div>

                {/* Edit Button Placeholder */}
                <button className="absolute top-0 right-0 md:relative md:top-auto md:right-auto px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-sm font-semibold border border-border/40">
                    Edit Profile
                </button>
            </div>
        </div>
    );
}
