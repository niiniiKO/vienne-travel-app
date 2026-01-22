"use client";

import { useState, useRef, useCallback, ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: ReactNode;
    className?: string;
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const isPulling = useRef(false);

    const THRESHOLD = 80; // Distance to trigger refresh
    const MAX_PULL = 120; // Maximum pull distance

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (containerRef.current?.scrollTop === 0 && !isRefreshing) {
            startY.current = e.touches[0].clientY;
            isPulling.current = true;
        }
    }, [isRefreshing]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isPulling.current || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0 && containerRef.current?.scrollTop === 0) {
            // Apply resistance to pull
            const distance = Math.min(diff * 0.5, MAX_PULL);
            setPullDistance(distance);
        }
    }, [isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling.current) return;
        isPulling.current = false;

        if (pullDistance >= THRESHOLD && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(THRESHOLD / 2); // Keep some distance while refreshing

            try {
                await onRefresh();
            } catch (error) {
                console.error("Refresh failed:", error);
            } finally {
                setIsRefreshing(false);
                setPullDistance(0);
            }
        } else {
            setPullDistance(0);
        }
    }, [pullDistance, isRefreshing, onRefresh]);

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-auto h-full", className)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            <div
                className={cn(
                    "absolute left-0 right-0 flex justify-center items-center transition-opacity z-10",
                    pullDistance > 0 || isRefreshing ? "opacity-100" : "opacity-0"
                )}
                style={{
                    top: Math.max(pullDistance - 40, -40),
                    height: 40,
                }}
            >
                <div
                    className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full bg-background border border-border shadow-md",
                        isRefreshing && "animate-spin"
                    )}
                >
                    <RefreshCw
                        className={cn(
                            "h-5 w-5 text-primary transition-transform",
                            pullDistance >= THRESHOLD && !isRefreshing && "text-secondary"
                        )}
                        style={{
                            transform: isRefreshing
                                ? undefined
                                : `rotate(${(pullDistance / THRESHOLD) * 180}deg)`,
                        }}
                    />
                </div>
            </div>

            {/* Content with transform */}
            <div
                className="transition-transform duration-200"
                style={{
                    transform: `translateY(${pullDistance}px)`,
                    transitionDuration: isPulling.current ? "0ms" : "200ms",
                }}
            >
                {children}
            </div>
        </div>
    );
}
