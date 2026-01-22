"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FABProps {
    onClick: () => void;
    label?: string;
    className?: string;
}

export function FAB({ onClick, label = "Add", className }: FABProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "fixed bottom-20 right-4 z-40",
                "h-14 w-14 rounded-full",
                "bg-secondary text-secondary-foreground",
                "shadow-lg hover:shadow-xl",
                "flex items-center justify-center",
                "transition-all hover:scale-110",
                "border-2 border-primary/20",
                className
            )}
            aria-label={label}
        >
            <Plus className="h-6 w-6" />
        </button>
    );
}
