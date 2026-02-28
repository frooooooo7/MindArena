import { z } from "zod";

// ============================================
// LOGIN SCHEMA
// ============================================

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================
// REGISTER SCHEMA
// ============================================

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================
// API RESPONSE TYPES
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  rankPoints: number;
  rankName: string;
  avatarUrl?: string | null;
}

export const profileNameParamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Profile name is required")
    .max(30, "Profile name is too long"),
});

export type ProfileNameParam = z.infer<typeof profileNameParamSchema>;

export type PublicUserProfileResponse = User;

// ============================================
// UPDATE PROFILE SCHEMA
// ============================================

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(30, "Name must be at most 30 characters")
    .optional(),
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;

export interface AuthResponse {
  user: User;
  accessToken: string;
}
