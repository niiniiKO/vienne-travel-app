"use client";

import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useState } from "react";
import { SettingsDrawer } from "./settings-drawer";

export function Header() {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between max-w-md mx-auto px-4">
                    <div className="flex-1" />
                    <h1 className="text-xl font-bold tracking-widest text-primary font-serif">
                        VIENNA 2026
                    </h1>
                    <div className="flex-1 flex justify-end">
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="p-2 hover:bg-secondary/10 rounded-md transition-colors"
                            aria-label="Settings"
                        >
                            <Menu className="h-5 w-5 text-primary" />
                        </button>
                    </div>
                </div>
            </header>
            <SettingsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </>
    );
}
