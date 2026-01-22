"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Schedule } from "@/types/database";
import { Trash2 } from "lucide-react";
import { useUser } from "@/contexts/user-context";

interface ScheduleFormProps {
    className?: string;
    onSuccess?: () => void;
    onDelete?: () => void | Promise<void>;
    onUpdate?: (schedule: Schedule) => void | Promise<void>;
    initialData?: Schedule;
}

export function ScheduleForm({ className, onSuccess, onDelete, onUpdate, initialData }: ScheduleFormProps) {
    const { tags } = useUser();
    const [title, setTitle] = React.useState(initialData?.title || "");
    const [date, setDate] = React.useState(() => {
        if (initialData?.start_time) {
            return new Date(initialData.start_time).toISOString().split("T")[0];
        }
        return new Date().toISOString().split("T")[0];
    });
    const [startTime, setStartTime] = React.useState(() => {
        if (initialData?.start_time) {
            return new Date(initialData.start_time).toTimeString().slice(0, 5);
        }
        return "10:00";
    });
    const [endTime, setEndTime] = React.useState(() => {
        if (initialData?.end_time) {
            return new Date(initialData.end_time).toTimeString().slice(0, 5);
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

        // Combine date and time
        const startDateTime = new Date(`${date}T${startTime}`).toISOString();
        const endDateTime = eventType === "range" 
            ? new Date(`${date}T${endTime}`).toISOString()
            : startDateTime;

        const scheduleData: Schedule = {
            id: initialData?.id || `schedule-${Date.now()}`,
            title,
            start_time: startDateTime,
            end_time: endDateTime,
            event_type: eventType,
            address,
            tag: selectedTags,
            memo,
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

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Date *</label>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Event Type</label>
                    <Select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value as Schedule["event_type"])}
                    >
                        <option value="point">Point Event</option>
                        <option value="range">Range Event</option>
                    </Select>
                </div>
            </div>

            <div className={eventType === "range" ? "grid grid-cols-2 gap-4" : ""}>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Start Time *</label>
                    <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                    />
                </div>
                {eventType === "range" && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">End Time *</label>
                        <Input
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                        />
                    </div>
                )}
            </div>

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

            <div className="space-y-2">
                <label className="text-sm font-medium">Memo</label>
                <textarea
                    className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    placeholder="メモ・注意事項など"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                    placeholder="e.g., Wollzeile 5, 1010 Wien, Austria"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
            </div>

            <div className="flex gap-2">
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
