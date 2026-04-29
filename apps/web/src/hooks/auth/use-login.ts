"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@mindarena/shared";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { getAuthErrorMessage, getSafeRedirectPath } from "@/lib/auth-helpers";

interface UseLoginOptions {
  onSuccess?: () => void;
  redirectTo?: string | null;
}

export function useLogin({ onSuccess, redirectTo = "/" }: UseLoginOptions = {}) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      const response = await authService.login(data);
      setAuth(response.user, response.accessToken);
      onSuccess?.();
      const safeRedirectPath = getSafeRedirectPath(redirectTo);
      if (safeRedirectPath) {
        router.push(safeRedirectPath);
      }
    } catch (err: unknown) {
      console.error("Login failed", err);
      setError(getAuthErrorMessage(err, "Invalid email or password"));
    }
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  return {
    form,
    error,
    showPassword,
    togglePassword,
    isSubmitting: form.formState.isSubmitting,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
