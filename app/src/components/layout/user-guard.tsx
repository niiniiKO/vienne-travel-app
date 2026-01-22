"use client";

import { useUser } from "@/contexts/user-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function UserGuard({ children }: { children: React.ReactNode }) {
    const { currentUser, isLoading } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !currentUser && pathname !== "/select-user") {
            router.push("/select-user");
        }
    }, [currentUser, isLoading, pathname, router]);

    // Show loading state while checking user
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" suppressHydrationWarning>
                <div className="text-center">
                    <div className="text-primary font-serif text-xl">Loading...</div>
                </div>
            </div>
        );
    }

    // Allow select-user page to render without user
    if (pathname === "/select-user") {
        return <>{children}</>;
    }

    // Don't render main app if no user selected
    if (!currentUser) {
        return null;
    }

    return <>{children}</>;
}
