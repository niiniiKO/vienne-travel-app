"use client";

import { useEffect, useRef, useState } from "react";
import { Schedule } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MapPin, Utensils, Train, Info, Copy, Check, Plane, ExternalLink } from "lucide-react";

// Extended type for display with date-crossing info
interface DisplaySchedule extends Schedule {
    isContinuedFromPreviousDay?: boolean;
    originalSchedule?: Schedule;
}

interface TimelineProps {
    items: DisplaySchedule[];
    onEdit?: (schedule: Schedule) => void;
}

// Format time in CET timezone
const formatTimeInCET = (isoString: string): string => {
    return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Vienna',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(isoString));
};

// Generate map URL based on platform
function getMapUrl(address: string): string {
    const encoded = encodeURIComponent(address);
    if (typeof navigator !== "undefined") {
        const ua = navigator.userAgent;
        // iOS: use Apple Maps URL
        if (/iPhone|iPad|iPod/i.test(ua)) {
            return `https://maps.apple.com/?q=${encoded}`;
        }
        // Android: use geo URI
        if (/Android/i.test(ua)) {
            return `geo:0,0?q=${encoded}`;
        }
    }
    // Fallback: Google Maps (works everywhere)
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
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
    const getIcon = (tags: string[] | null | undefined, isContinued?: boolean) => {
        // Show plane icon for continued events (date-crossing flights)
        if (isContinued) return <Plane className="h-4 w-4" />;
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
                const isContinued = item.isContinuedFromPreviousDay;
                
                // Use CET timezone for all time displays
                const startTime = formatTimeInCET(item.start_time);
                const endTime = formatTimeInCET(item.end_time);
                const isRangeEvent = item.event_type === "range";

                // For continued events, show "〜{endTime}" to indicate arrival
                const displayTime = isContinued ? `〜${endTime}` : startTime;

                return (
                    <div key={`${item.id}-${isContinued ? 'continued' : 'start'}`} className="relative flex group" ref={current ? currentRef : undefined}>
                        {/* Time Column */}
                        <div className="w-14 flex-shrink-0 flex flex-col items-end pr-4 pt-1">
                            <span className={cn(
                                "text-sm font-bold tabular-nums",
                                isContinued ? "text-muted-foreground" : current ? "text-secondary" : "text-primary"
                            )}>
                                {displayTime}
                            </span>
                            {isRangeEvent && !isContinued && (
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    ↓ {endTime}
                                </span>
                            )}
                        </div>

                        {/* Dot & Connector */}
                        <div className={cn(
                            "absolute left-[3.35rem] mt-1.5 h-3 w-3 rounded-full border-2 bg-background z-10",
                            isContinued ? "border-dashed border-muted-foreground" : current ? "border-secondary animate-pulse" : "border-primary"
                        )} />

                        {/* Content Card */}
                        <div className="flex-1 pb-2">
                            <Card
                                className={cn(
                                    "ml-4 transition-all cursor-pointer",
                                    isContinued && "border-dashed border-muted-foreground/50 bg-muted/20",
                                    !isContinued && current && "border-secondary shadow-md ring-2 ring-secondary/20",
                                    !isContinued && !current && "hover:shadow-md",
                                    onEdit && "hover:border-primary/50"
                                )}
                                onClick={() => onEdit?.(item)}
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {isContinued && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                                                        到着
                                                    </span>
                                                )}
                                                <h3 className="font-bold text-lg leading-tight mb-1">
                                                    {item.title}
                                                </h3>
                                            </div>
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
                                                        href={getMapUrl(item.address)}
                                                        className="text-sm text-primary/80 hover:text-primary flex items-center gap-1 underline underline-offset-2"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MapPin className="h-3 w-3 flex-shrink-0" />
                                                        <span className="line-clamp-1">{item.address}</span>
                                                    </a>
                                                    <CopyButton text={item.address} />
                                                </div>
                                            )}
                                            {item.url && (
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-primary/80 hover:text-primary flex items-center gap-1 underline underline-offset-2"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                        <span className="line-clamp-1">
                                                            {(() => { try { return new URL(item.url).hostname; } catch { return item.url; } })()}
                                                        </span>
                                                    </a>
                                                    <CopyButton text={item.url} />
                                                </div>
                                            )}
                                            {item.memo && (
                                                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                                                    {item.memo}
                                                </p>
                                            )}
                                        </div>
                                        <div className="p-1.5 rounded-full bg-secondary/10 text-secondary-foreground ml-2">
                                            {getIcon(item.tag, isContinued)}
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
