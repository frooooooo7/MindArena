import { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/home/footer";
import {
  AuthCard,
  AuthTabs,
  TabContent,
  LoginForm,
  RegisterForm,
  SocialAuth,
} from "@/components/auth";

export const metadata: Metadata = {
  title: "Sign In - MindArena",
  description: "Sign in or create an account to start training your mind",
};

export default function AuthPage() {
  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="relative flex flex-1 items-center justify-center p-4 py-12 sm:py-16">
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute -top-40 size-[30rem] rounded-full bg-portal-violet/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 size-[30rem] rounded-full bg-portal-mint/10 blur-3xl" />

        <div className="w-full max-w-md relative z-10">
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
