import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const api = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Important for cookies (refresh token)
});

// Request interceptor to add access token
api.interceptors.request.use((config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const response = await api.post("/auth/refresh");
                const { accessToken, user } = response.data;

                // Update store
                useAuthStore.getState().setAuth(user, accessToken);

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login or handle logout
                useAuthStore.getState().clearAuth();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
