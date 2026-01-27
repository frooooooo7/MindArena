import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@mindarena/shared";

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    setAuth: (user: User, accessToken: string) => void;
    clearAuth: () => void;
    updateUser: (user: User) => void;
    setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isHydrated: false,
            setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true }),
            clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
            updateUser: (user) => set({ user }),
            setHydrated: () => set({ isHydrated: true }),
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
        }
    )
);
