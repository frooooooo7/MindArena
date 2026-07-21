import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MindArena - Memory Games & Challenges",
  description:
    "Compete with other players in exciting memory games. Develop your cognitive abilities and climb the rankings!",
};

import { ThemeProvider } from "@/components/theme-provider";
import { FriendRequestListener } from "@/components/friend-request-listener";
import { DuelInvitationListener } from "@/components/duel-invitation-listener";
import { DuelFriendPicker } from "@/components/arena/duel-friend-picker";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          {children}
          <FriendRequestListener />
          <DuelInvitationListener />
          <DuelFriendPicker />
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
