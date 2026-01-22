"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Schedule } from "@/types/database";
import { Trash2, ChevronDown, ChevronUp, MapPin, AlignLeft, Globe } from "lucide-react";
import { useUser } from "@/contexts/user-context";

interface ScheduleFormProps {
    className?: string;
    onSuccess?: () => void;
    onDelete?: () => void | Promise<void>;
    onUpdate?: (schedule: Schedule) => void | Promise<void>;
    initialData?: Schedule;
    defaultDate?: string;
}

// Helper to format date/time in CET (Europe/Vienna)
const formatInCET = (isoString: string, type: 'date' | 'time') => {
    try {
        const date = new Date(isoString);
        if (type === 'date') {
            // Returns YYYY-MM-DD
            return new Intl.DateTimeFormat('en-CA', {
                timeZone: 'Europe/Vienna',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(date);
        } else {
            // Returns HH:mm
            return new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Europe/Vienna',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        }
    } catch (e) {
        console.error("Date formatting error", e);
        return type === 'date' ? new Date().toISOString().split('T')[0] : '00:00';
    }
};

export function ScheduleForm({ className, onSuccess, onDelete, onUpdate, initialData, defaultDate }: ScheduleFormProps) {
    const { tags } = useUser();

    // UI State
    const [isMoreOpen, setIsMoreOpen] = React.useState(false);
    const [timezone, setTimezone] = React.useState<'CET' | 'JST' | 'TRT'>('CET');

    // Form State
    const [title, setTitle] = React.useState(initialData?.title || "");

    const [date, setDate] = React.useState(() => {
        if (initialData?.start_time) {
            return formatInCET(initialData.start_time, 'date');
        }
        if (defaultDate) {
            return defaultDate;
        }
        // Default to current date in CET
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Vienna',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
    });

    const [startTime, setStartTime] = React.useState(() => {
        if (initialData?.start_time) {
            return formatInCET(initialData.start_time, 'time');
        }
        return "10:00";
    });

    const [endTime, setEndTime] = React.useState(() => {
        if (initialData?.end_time) {
            return formatInCET(initialData.end_time, 'time');
        }
        return "12:00";
    });

    const [eventType, setEventType] = React.useState<Schedule["event_type"]>(
        initialData?.event_type || "point"
    );
    const [address, setAddress] = React.useState(initialData?.address || "");
    const [selectedTags, setSelectedTags] = React.useState<string[]>(initialData?.tag || []);
    const [memo, setMemo] = React.useState(initialData?.memo || "");

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Determine offset based on selected timezone
        let offset = '+01:00'; // Default CET (Winter time in Feb is UTC+1)
        let memoSuffix = '';

        if (timezone === 'JST') {
            offset = '+09:00';
            const timeStr = eventType === 'range' ? `${startTime}-${endTime}` : startTime;
            memoSuffix = `${timeStr}(JST)`;
        } else if (timezone === 'TRT') {
            offset = '+03:00';
            const timeStr = eventType === 'range' ? `${startTime}-${endTime}` : startTime;
            memoSuffix = `${timeStr}(TRT)`;
        }

        // Construct ISO strings using the selected offset
        // We create the date string with the offset, then let Date parse it and toISOString convert to UTC
        const startDateTime = new Date(`${date}T${startTime}:00${offset}`).toISOString();

        const endDateTime = eventType === "range" 
            ? new Date(`${date}T${endTime}:00${offset}`).toISOString()
            : startDateTime;

        // Append timezone info to memo if needed
        let finalMemo = memo;
        if (memoSuffix) {
            // Add a newline if there's existing content
            finalMemo = memo ? `${memo}\n${memoSuffix}` : memoSuffix;
        }

        const scheduleData: Schedule = {
            id: initialData?.id || `schedule-${Date.now()}`,
            title,
            start_time: startDateTime,
            end_time: endDateTime,
            event_type: eventType,
            address,
            tag: selectedTags,
            memo: finalMemo,
            created_at: initialData?.created_at || new Date().toISOString(),
        };

        onUpdate?.(scheduleData);
        onSuccess?.();
    };

    const handleDelete = async () => {
        if (confirm("このスケジュールを削除しますか?")) {
            await onDelete?.();
            onSuccess?.();
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
            <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                    placeholder="e.g., ランチ @ Figlmüller"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            {/* Layout Fix: Stack Date and Event Type to avoid overlap on small screens */}
            <div className="flex flex-col gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Date *</label>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Event Type</label>
                    <div className="flex bg-secondary/20 p-1 rounded-md">
                        <button
                            type="button"
                            onClick={() => setEventType("point")}
                            className={cn(
                                "flex-1 py-1.5 px-3 text-sm font-medium rounded-sm transition-all",
                                eventType === "point"
                                    ? "bg-background text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            Point
                        </button>
                        <button
                            type="button"
                            onClick={() => setEventType("range")}
                            className={cn(
                                "flex-1 py-1.5 px-3 text-sm font-medium rounded-sm transition-all",
                                eventType === "range"
                                    ? "bg-background text-primary shadow-sm"
                                    : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            Range
                        </button>
                    </div>
                </div>
            </div>

            {/* Time Inputs */}
            {eventType === "range" ? (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Start Time *</label>
                        <Input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">End Time *</label>
                        <Input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <label className="text-sm font-medium">Start Time *</label>
                    <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="w-full"
                    />
                </div>
            )}

            <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.name)}
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                                selectedTags.includes(tag.name)
                                    ? "bg-secondary text-secondary-foreground border-secondary"
                                    : "bg-background text-muted-foreground border-input hover:border-secondary"
                            )}
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* More Accordion */}
            <div className="border rounded-lg overflow-hidden">
                <button
                    type="button"
                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                    className="w-full flex items-center justify-between p-3 bg-secondary/10 hover:bg-secondary/20 transition-colors text-sm font-medium"
                >
                    <span className="flex items-center gap-2">
                        <AlignLeft className="h-4 w-4" />
                        More Details
                    </span>
                    {isMoreOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </button>

                {isMoreOpen && (
                    <div className="p-4 space-y-4 bg-secondary/5 border-t">
                        {/* Timezone Selector */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Globe className="h-3.5 w-3.5" />
                                Input Timezone
                            </label>
                            <div className="flex gap-2">
                                {(['CET', 'JST', 'TRT'] as const).map((tz) => (
                                    <button
                                        key={tz}
                                        type="button"
                                        onClick={() => setTimezone(tz)}
                                        className={cn(
                                            "flex-1 px-3 py-2 text-xs font-medium rounded border transition-colors",
                                            timezone === tz
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background text-muted-foreground border-input hover:border-primary"
                                        )}
                                    >
                                        {tz === 'CET' && "Default (CET)"}
                                        {tz === 'JST' && "Japan (JST)"}
                                        {tz === 'TRT' && "Istanbul (TRT)"}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Times will be converted to Default (CET) automatically.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <AlignLeft className="h-3.5 w-3.5" />
                                Memo
                            </label>
                            <textarea
                                className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                                placeholder="メモ・注意事項など"
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5" />
                                Address
                            </label>
                            <Input
                                placeholder="e.g., Wollzeile 5, 1010 Wien"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-2 pt-2">
                <Button type="submit" variant="gold" className="flex-1" size="lg">
                    {initialData ? "Update Schedule" : "Create Schedule"}
                </Button>
                {initialData && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </form>
    );
}
