"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // Hide nav on potential full screen pages if needed, but for now show always
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
            <Header />
            <main className="flex-1 p-4 container mx-auto max-w-md">{children}</main>
            <BottomNav />
        </div>
    );
}
