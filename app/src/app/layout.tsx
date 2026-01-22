import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google"; // Using Noto Serif JP for elegant Japanese text
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TransactionManager } from "@/components/accounting/transaction-manager";
import { ScheduleManager } from "@/components/schedule/schedule-manager";
import { UserProvider } from "@/contexts/user-context";
import { UserGuard } from "@/components/layout/user-guard";

const serif = Noto_Serif_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Vienna Travel 2026",
  description: "卒業旅行（ウィーン・ドイツ）管理アプリ",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-serif antialiased flex flex-col",
          serif.variable
        )}
      >
        <UserProvider>
          <UserGuard>
            <Header />
            <main className="flex-1 w-full max-w-md mx-auto p-4 pb-24">
              {children}
            </main>
            <TransactionManager />
            <ScheduleManager />
            <BottomNav />
          </UserGuard>
        </UserProvider>
      </body>
    </html>
  );
}
