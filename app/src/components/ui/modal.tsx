"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    // Lock body scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className={cn(
                    "relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg bg-background shadow-lg animate-in zoom-in-95 duration-200 border border-border overflow-hidden",
                    className
                )}
            >
                <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
                    {title && <h2 className="text-lg font-semibold font-serif">{title}</h2>}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 rounded-full"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>
            </div>
        </div>
    );
}
