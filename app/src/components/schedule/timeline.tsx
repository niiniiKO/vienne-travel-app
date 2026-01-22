"use client";

import { useEffect, useRef, useState } from "react";
import { Schedule } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MapPin, Utensils, Train, Info, ExternalLink, Copy, Check } from "lucide-react";

interface TimelineProps {
    items: Schedule[];
    onEdit?: (schedule: Schedule) => void;
}

// Copy button component with feedback
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1 hover:bg-secondary/20 rounded transition-colors flex-shrink-0"
            title="住所をコピー"
        >
            {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
            )}
        </button>
    );
}

export function Timeline({ items, onEdit }: TimelineProps) {
    const currentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to current event logic
        if (currentRef.current) {
            currentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, []);

    // Helper to check if event is current (happening now)
    const isCurrent = (item: Schedule) => {
        const now = new Date();
        const start = new Date(item.start_time);
        const end = new Date(item.end_time);
        return now >= start && now <= end;
    };

    // Helper to get tag icon
    const getIcon = (tags: string[] | null | undefined) => {
        if (!tags || tags.length === 0) return <Info className="h-4 w-4" />;
        const firstTag = tags[0];
        switch (firstTag) {
            case "food": return <Utensils className="h-4 w-4" />;
            case "move": return <Train className="h-4 w-4" />;
            case "sightseeing": return <MapPin className="h-4 w-4" />;
            default: return <Info className="h-4 w-4" />;
        }
    };

    return (
        <div className="relative py-4 space-y-6">
            {/* Vertical Line */}
            <div className="absolute left-[3.5rem] top-0 bottom-0 w-0.5 bg-border/50" />

            {items.map((item, index) => {
                const current = isCurrent(item);
                const startTime = new Date(item.start_time).toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                });
                const endTime = new Date(item.end_time).toLocaleTimeString("ja-JP", {
                    hour: "2-digit",
                    minute: "2-digit",
                });
                const isRangeEvent = item.event_type === "range";

                return (
                    <div key={item.id} className="relative flex group" ref={current ? currentRef : undefined}>
                        {/* Time Column */}
                        <div className="w-14 flex-shrink-0 flex flex-col items-end pr-4 pt-1">
                            <span className={cn(
                                "text-sm font-bold tabular-nums",
                                current ? "text-secondary" : "text-primary"
                            )}>
                                {startTime}
                            </span>
                            {isRangeEvent && (
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    ↓ {endTime}
                                </span>
                            )}
                        </div>

                        {/* Dot & Connector */}
                        <div className={cn(
                            "absolute left-[3.35rem] mt-1.5 h-3 w-3 rounded-full border-2 bg-background z-10",
                            current ? "border-secondary animate-pulse" : "border-primary"
                        )} />

                        {/* Content Card */}
                        <div className="flex-1 pb-2">
                            <Card
                                className={cn(
                                    "ml-4 transition-all cursor-pointer",
                                    current ? "border-secondary shadow-md ring-2 ring-secondary/20" : "hover:shadow-md",
                                    onEdit && "hover:border-primary/50"
                                )}
                                onClick={() => onEdit?.(item)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg leading-tight mb-1">
                                                {item.title}
                                            </h3>
                                            {item.tag && item.tag.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-1">
                                                    {item.tag.map((t) => (
                                                        <span
                                                            key={t}
                                                            className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground"
                                                        >
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {item.address && (
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <a
                                                        href={`https://maps.google.com/?q=${encodeURIComponent(item.address)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-primary/80 hover:text-primary flex items-center gap-1 underline underline-offset-2"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                        <span className="line-clamp-1">{item.address}</span>
                                                    </a>
                                                    <CopyButton text={item.address} />
                                                </div>
                                            )}
                                            {item.memo && (
                                                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                                                    {item.memo}
                                                </p>
                                            )}
                                        </div>
                                        <div className="p-1.5 rounded-full bg-secondary/10 text-secondary-foreground ml-2">
                                            {getIcon(item.tag)}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
