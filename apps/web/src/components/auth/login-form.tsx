"use client";

import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useLogin } from "@/hooks/auth/use-login";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string | null;
}

export function LoginForm({ onSuccess, redirectTo }: LoginFormProps = {}) {
  const {
    form: {
      register,
      formState: { errors },
    },
    error,
    showPassword,
    togglePassword,
    isSubmitting,
    onSubmit,
  } = useLogin({ onSuccess, redirectTo });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-destructive/30 bg-destructive/15 p-3 text-xs font-semibold text-destructive"
        >
          {error}
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="text-xs font-bold text-foreground/90">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="login-email"
            type="email"
            placeholder="name@example.com"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground transition-colors focus:border-portal-mint/50 focus:bg-white/[0.05] focus:outline-none"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-[0.7rem] font-semibold text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-xs font-bold text-foreground/90">
            Password
          </label>
          <button
            type="button"
            className="text-xs font-semibold text-portal-mint hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground transition-colors focus:border-portal-mint/50 focus:bg-white/[0.05] focus:outline-none"
            {...register("password")}
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[0.7rem] font-semibold text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id="remember"
          className="size-4 rounded border-white/20 bg-white/5 accent-portal-mint"
        />
        <label htmlFor="remember" className="text-xs font-medium text-muted-foreground">
          Remember this session
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="group flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-portal-mint px-4 py-2.5 text-xs font-extrabold text-[#07150f] transition-all hover:bg-portal-mint/90 hover:shadow-[0_0_20px_rgba(112,245,193,0.35)] disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span>Sign In to Arena</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}

