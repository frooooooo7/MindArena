"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@mindarena/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

export function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            terms: false,
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            setError(null);
            await authService.register(data);
            router.push("/");
        } catch (err: any) {
            console.error("Registration failed", err);
            setError(err.response?.data?.error || "Registration failed. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                    {error}
                </div>
            )}

            {/* Name Field */}
            <div className="space-y-2">
                <Label htmlFor="register-name" className="text-sm font-medium">
                    Name
                </Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="register-name"
                        type="text"
                        placeholder="Enter your name"
                        className="pl-10 h-11"
                        {...register("name")}
                    />
                </div>
                {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
                <Label htmlFor="register-email" className="text-sm font-medium">
                    Email
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 h-11"
                        {...register("email")}
                    />
                </div>
                {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <Label htmlFor="register-password" className="text-sm font-medium">
                    Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        className="pl-10 pr-10 h-11"
                        {...register("password")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
                <Label htmlFor="register-confirm" className="text-sm font-medium">
                    Confirm Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="register-confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="pl-10 pr-10 h-11"
                        {...register("confirmPassword")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                        {errors.confirmPassword.message}
                    </p>
                )}
            </div>

            {/* Terms Checkbox */}
            <div className="space-y-1">
                <div className="flex items-start gap-2">
                    <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 h-4 w-4 rounded border-input bg-background accent-violet-600"
                        {...register("terms")}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                        I agree to the{" "}
                        <button
                            type="button"
                            className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline-offset-4 hover:underline"
                        >
                            Terms of Service
                        </button>{" "}
                        and{" "}
                        <button
                            type="button"
                            className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 underline-offset-4 hover:underline"
                        >
                            Privacy Policy
                        </button>
                    </label>
                </div>
                {errors.terms && (
                    <p className="text-sm text-destructive">{errors.terms.message}</p>
                )}
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                    </>
                ) : (
                    "Create Account"
                )}
            </Button>
        </form>
    );
}
