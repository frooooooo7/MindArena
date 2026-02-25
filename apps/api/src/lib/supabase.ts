import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";

// Ensure variables exist in production (fail fast)
if (env.NODE_ENV === "production" && (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY)) {
    throw new Error("Missing SUPABASE configuration in environment variables.");
}

// Initialize the Supabase client with the Service Role Key
// IMPORTANT: This key acts as an admin and bypasses Row Level Security.
// NEVER expose this key to the frontend.
export const supabase = createClient(
    env.SUPABASE_URL || "http://placeholder.supabase.co", // Allows dev to start without env vars
    env.SUPABASE_SERVICE_KEY || "placeholder_key"
);

export const AVATAR_BUCKET = "avatars";
