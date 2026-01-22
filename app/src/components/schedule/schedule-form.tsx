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

type TimezoneType = 'CET' | 'JST' | 'TRT';

// Helper to get timezone offset
const getTimezoneOffset = (tz: TimezoneType): string => {
    switch (tz) {
        case 'JST': return '+09:00';
        case 'TRT': return '+03:00';
        case 'CET':
        default: return '+01:00';
    }
};

// Helper to format date/time in a specific timezone
const formatInTimezone = (isoString: string, type: 'date' | 'time', timezone: string) => {
    try {
        const date = new Date(isoString);
        if (type === 'date') {
            return new Intl.DateTimeFormat('en-CA', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(date);
        } else {
            return new Intl.DateTimeFormat('en-GB', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        }
    } catch (e) {
        console.error("Date formatting error", e);
        return type === 'date' ? new Date().toISOString().split('T')[0] : '00:00';
    }
};

// Helper to detect timezone from ISO string (approximation based on common offsets)
const detectTimezone = (isoString: string): TimezoneType => {
    try {
        const date = new Date(isoString);
        // Get the hour in each timezone and compare with UTC hour
        const utcHour = date.getUTCHours();
        const cetHour = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Vienna', hour: '2-digit' }).format(date));
        const jstHour = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', hour: '2-digit' }).format(date));
        const trtHour = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Istanbul', hour: '2-digit' }).format(date));
        
        // Default to CET as it's the primary timezone for this trip
        return 'CET';
    } catch {
        return 'CET';
    }
};

export function ScheduleForm({ className, onSuccess, onDelete, onUpdate, initialData, defaultDate }: ScheduleFormProps) {
    const { tags } = useUser();

    // UI State
    const [isMoreOpen, setIsMoreOpen] = React.useState(false);
    const [startTimezone, setStartTimezone] = React.useState<TimezoneType>('CET');
    const [endTimezone, setEndTimezone] = React.useState<TimezoneType>('CET');
    const [dateError, setDateError] = React.useState<string | null>(null);

    // Form State
    const [title, setTitle] = React.useState(initialData?.title || "");

    const [startDate, setStartDate] = React.useState(() => {
        if (initialData?.start_time) {
            return formatInTimezone(initialData.start_time, 'date', 'Europe/Vienna');
        }
        if (defaultDate) {
            return defaultDate;
        }
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Vienna',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
    });

    const [endDate, setEndDate] = React.useState(() => {
        if (initialData?.end_time) {
            return formatInTimezone(initialData.end_time, 'date', 'Europe/Vienna');
        }
        if (defaultDate) {
            return defaultDate;
        }
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Vienna',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
    });

    const [startTime, setStartTime] = React.useState(() => {
        if (initialData?.start_time) {
            return formatInTimezone(initialData.start_time, 'time', 'Europe/Vienna');
        }
        return "10:00";
    });

    const [endTime, setEndTime] = React.useState(() => {
        if (initialData?.end_time) {
            return formatInTimezone(initialData.end_time, 'time', 'Europe/Vienna');
        }
        return "12:00";
    });

    const [eventType, setEventType] = React.useState<Schedule["event_type"]>(
        initialData?.event_type || "point"
    );
    const [address, setAddress] = React.useState(initialData?.address || "");
    const [selectedTags, setSelectedTags] = React.useState<string[]>(initialData?.tag || []);
    const [memo, setMemo] = React.useState(initialData?.memo || "");

    // Validate dates
    React.useEffect(() => {
        if (eventType === 'range') {
            const start = new Date(`${startDate}T${startTime}`);
            const end = new Date(`${endDate}T${endTime}`);
            if (end < start) {
                setDateError("End Date/Time must be after Start Date/Time");
            } else {
                setDateError(null);
            }
        } else {
            setDateError(null);
        }
    }, [startDate, endDate, startTime, endTime, eventType]);

    // Sync endDate with startDate when eventType changes to range
    React.useEffect(() => {
        if (eventType === 'range' && !initialData) {
            setEndDate(startDate);
        }
    }, [eventType, startDate, initialData]);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (dateError) {
            alert(dateError);
            return;
        }

        // Get offsets for start and end timezones
        const startOffset = getTimezoneOffset(startTimezone);
        const endOffset = getTimezoneOffset(endTimezone);

        // Build memo suffix for non-CET timezones
        let memoSuffix = '';
        if (startTimezone !== 'CET' || (eventType === 'range' && endTimezone !== 'CET')) {
            const parts: string[] = [];
            if (startTimezone !== 'CET') {
                parts.push(`Start: ${startTime}(${startTimezone})`);
            }
            if (eventType === 'range' && endTimezone !== 'CET') {
                parts.push(`End: ${endTime}(${endTimezone})`);
            }
            memoSuffix = parts.join(', ');
        }

        // Construct ISO strings
        const startDateTime = new Date(`${startDate}T${startTime}:00${startOffset}`).toISOString();
        const endDateTime = eventType === "range" 
            ? new Date(`${endDate}T${endTime}:00${endOffset}`).toISOString()
            : startDateTime;

        // Append timezone info to memo if needed
        let finalMemo = memo;
        if (memoSuffix) {
            finalMemo = memo ? `${memo}\n${memoSuffix}` : memoSuffix;
        }

        const scheduleData: Partial<Schedule> & Omit<Schedule, 'id' | 'created_at'> = {
            title,
            start_time: startDateTime,
            end_time: endDateTime,
            event_type: eventType,
            address: address || null,
            tag: selectedTags.length > 0 ? selectedTags : null,
            memo: finalMemo || null,
        };

        // Only include id and created_at for existing schedules
        if (initialData?.id) {
            (scheduleData as Schedule).id = initialData.id;
            (scheduleData as Schedule).created_at = initialData.created_at;
        }

        onUpdate?.(scheduleData as Schedule);
        onSuccess?.();
    };

    const handleDelete = async () => {
        if (confirm("このスケジュールを削除しますか?")) {
            await onDelete?.();
            onSuccess?.();
        }
    };

    // Timezone selector component
    const TimezoneSelector = ({ value, onChange, label }: { value: TimezoneType; onChange: (tz: TimezoneType) => void; label: string }) => (
        <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {label}
            </label>
            <div className="flex gap-1">
                {(['CET', 'JST', 'TRT'] as const).map((tz) => (
                    <button
                        key={tz}
                        type="button"
                        onClick={() => onChange(tz)}
                        className={cn(
                            "flex-1 px-2 py-1 text-[10px] font-medium rounded border transition-colors",
                            value === tz
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-input hover:border-primary"
                        )}
                    >
                        {tz}
                    </button>
                ))}
            </div>
        </div>
    );

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

            {/* Event Type */}
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

            {/* Date and Time Inputs */}
            {eventType === "range" ? (
                <div className="space-y-4">
                    {/* Start Date/Time */}
                    <div className="p-3 border rounded-lg bg-secondary/5 space-y-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Start</div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Date *</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                    className="w-full text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Time *</label>
                                <Input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    required
                                    className="w-full text-sm"
                                />
                            </div>
                        </div>
                        <TimezoneSelector value={startTimezone} onChange={setStartTimezone} label="Input TZ" />
                    </div>

                    {/* End Date/Time */}
                    <div className="p-3 border rounded-lg bg-secondary/5 space-y-3">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">End</div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Date *</label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                    className="w-full text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium">Time *</label>
                                <Input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                    className="w-full text-sm"
                                />
                            </div>
                        </div>
                        <TimezoneSelector value={endTimezone} onChange={setEndTimezone} label="Input TZ" />
                    </div>

                    {/* Date Error */}
                    {dateError && (
                        <p className="text-xs text-red-500 font-medium">{dateError}</p>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Date *</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Time *</label>
                            <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                                className="w-full"
                            />
                        </div>
                    </div>
                    <TimezoneSelector value={startTimezone} onChange={setStartTimezone} label="Input TZ" />
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
                    </div>
                )}
            </div>

            <div className="flex gap-2 pt-2">
                <Button type="submit" variant="gold" className="flex-1" size="lg" disabled={!!dateError}>
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
