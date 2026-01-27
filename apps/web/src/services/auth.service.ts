import { api } from "@/lib/axios";
import { LoginFormData, RegisterFormData, AuthResponse, User } from "@mindarena/shared";

export const authService = {
    async register(data: RegisterFormData): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>("/auth/register", data);
        return response.data;
    },

    async login(data: LoginFormData): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>("/auth/login", data);
        return response.data;
    },

    async logout(): Promise<void> {
        await api.post("/auth/logout");
    },

    async refresh(): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>("/auth/refresh");
        return response.data;
    },

    // Helper to get current user from local storage or memory if needed
    // But typically we'd use a context or state management for this
};
