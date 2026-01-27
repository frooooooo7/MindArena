"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLogin } from "@/hooks/auth/use-login";

export function LoginForm() {
    const { 
        form: { register, formState: { errors } },
        error,
        showPassword,
        togglePassword,
        isSubmitting,
        onSubmit 
    } = useLogin();

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                    {error}
                </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium">
                    Email
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="login-email"
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
                <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="text-sm font-medium">
                        Password
                    </Label>
                    <button
                        type="button"
                        className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
                    >
                        Forgot password?
                    </button>
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 h-11"
                        {...register("password")}
                    />
                    <button
                        type="button"
                        onClick={togglePassword}
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

            {/* Remember Me */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-input bg-background accent-violet-600"
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground">
                    Remember me
                </label>
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
                        Signing in...
                    </>
                ) : (
                    "Sign In"
                )}
            </Button>
        </form>
    );
}
