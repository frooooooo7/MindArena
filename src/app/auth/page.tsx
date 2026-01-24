import { BackgroundGradients } from "@/components/home";
import {
    AuthCard,
    AuthTabs,
    TabContent,
    LoginForm,
    RegisterForm,
    SocialAuth,
} from "@/components/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In - MindArena",
    description: "Sign in or create an account to start training your mind",
};

export default function AuthPage() {
    return (
        <div className="relative min-h-screen bg-background">
            {/* Background Gradients */}
            <BackgroundGradients />

            {/* Main Content */}
            <main className="relative flex min-h-screen items-center justify-center p-4">
                <AuthCard>
                    <AuthTabs defaultTab="login">
                        <TabContent value="login">
                            <LoginForm />
                            <SocialAuth />
                        </TabContent>
                        <TabContent value="register">
                            <RegisterForm />
                            <SocialAuth />
                        </TabContent>
                    </AuthTabs>
                </AuthCard>
            </main>
        </div>
    );
}
