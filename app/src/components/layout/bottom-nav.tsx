"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Wallet, List, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const tabs = [
        { href: "/", label: "Schedule", icon: Calendar },
        { href: "/accounting", label: "Accounting", icon: Wallet },
        { href: "/wishes", label: "Wishes", icon: List },
        { href: "/info", label: "Info", icon: Menu },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background pb-safe">
            <div className="container flex h-16 items-center justify-around max-w-md mx-auto">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <tab.icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
