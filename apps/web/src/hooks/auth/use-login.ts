"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@mindarena/shared";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export function useLogin() {
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
            router.push("/");
        } catch (err: any) {
            console.error("Login failed", err);
            setError(err.response?.data?.error || "Invalid email or password");
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
