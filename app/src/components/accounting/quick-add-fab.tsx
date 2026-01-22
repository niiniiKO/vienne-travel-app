"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickAddFABProps {
    onClick: () => void;
    className?: string;
}

export function QuickAddFAB({ onClick, className }: QuickAddFABProps) {
    return (
        <Button
            onClick={onClick}
            variant="gold"
            size="icon"
            className={cn(
                "fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg shadow-black/20 z-40 transition-transform hover:scale-105 active:scale-95",
                className
            )}
        >
            <Plus className="h-8 w-8 text-white" />
            <span className="sr-only">Add Transaction</span>
        </Button>
    );
}
