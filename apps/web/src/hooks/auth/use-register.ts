"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@mindarena/shared";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { getAuthErrorMessage, getSafeRedirectPath } from "@/lib/auth-helpers";

interface UseRegisterOptions {
  onSuccess?: () => void;
  redirectTo?: string | null;
}

export function useRegister({ onSuccess, redirectTo = "/" }: UseRegisterOptions = {}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      const response = await authService.register(data);
      setAuth(response.user, response.accessToken);
      onSuccess?.();
      const safeRedirectPath = getSafeRedirectPath(redirectTo);
      if (safeRedirectPath) {
        router.push(safeRedirectPath);
      }
    } catch (err: unknown) {
      console.error("Registration failed", err);
      setError(getAuthErrorMessage(err, "Registration failed. Please try again."));
    }
  };

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  return {
    form,
    error,
    showPassword,
    showConfirmPassword,
    togglePassword,
    toggleConfirmPassword,
    isSubmitting: form.formState.isSubmitting,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
