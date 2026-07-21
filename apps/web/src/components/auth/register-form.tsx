"use client";

import { Mail, Lock, Eye, EyeOff, User, Loader2, ArrowRight } from "lucide-react";
import { useRegister } from "@/hooks/auth/use-register";

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string | null;
}

export function RegisterForm({ onSuccess, redirectTo }: RegisterFormProps = {}) {
  const {
    form: {
      register,
      formState: { errors },
    },
    error,
    showPassword,
    showConfirmPassword,
    togglePassword,
    toggleConfirmPassword,
    isSubmitting,
    onSubmit,
  } = useRegister({ onSuccess, redirectTo });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/15 p-3 text-xs font-semibold text-destructive">
          {error}
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-1.5">
        <label htmlFor="register-name" className="text-xs font-bold text-foreground/90">
          Display Name
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="register-name"
            type="text"
            placeholder="Choose your handle"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground transition-colors focus:border-portal-mint/50 focus:bg-white/[0.05] focus:outline-none"
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-[0.7rem] font-semibold text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <label htmlFor="register-email" className="text-xs font-bold text-foreground/90">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="register-email"
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
        <label htmlFor="register-password" className="text-xs font-bold text-foreground/90">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
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

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <label htmlFor="register-confirm" className="text-xs font-bold text-foreground/90">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="register-confirm"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground transition-colors focus:border-portal-mint/50 focus:bg-white/[0.05] focus:outline-none"
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={toggleConfirmPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-[0.7rem] font-semibold text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms Checkbox */}
      <div className="space-y-1 pt-1">
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            className="mt-0.5 size-4 rounded border-white/20 bg-white/5 accent-portal-mint"
            {...register("terms")}
          />
          <label htmlFor="terms" className="text-xs leading-relaxed text-muted-foreground">
            I agree to the{" "}
            <button type="button" className="text-portal-mint hover:underline">
              Terms of Service
            </button>{" "}
            and{" "}
            <button type="button" className="text-portal-mint hover:underline">
              Privacy Policy
            </button>
          </label>
        </div>
        {errors.terms && (
          <p className="text-[0.7rem] font-semibold text-destructive">{errors.terms.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-portal-mint px-4 py-2.5 text-xs font-extrabold text-[#07150f] transition-all hover:bg-portal-mint/90 hover:shadow-[0_0_20px_rgba(112,245,193,0.35)] disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Creating account...</span>
          </>
        ) : (
          <>
            <span>Join MindArena</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
}

