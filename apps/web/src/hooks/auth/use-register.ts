"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@mindarena/shared";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { error?: string } } })
      .response;
    if (response?.data?.error) {
      return response.data.error;
    }
  }
  return fallback;
}

export function useRegister() {
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
      router.push("/");
    } catch (err: unknown) {
      console.error("Registration failed", err);
      setError(getErrorMessage(err, "Registration failed. Please try again."));
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
