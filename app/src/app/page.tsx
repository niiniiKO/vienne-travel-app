"use client";

import { useState } from "react";
import { Timeline } from "@/components/schedule/timeline";
import { Schedule } from "@/types/database";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ScheduleManager, openScheduleForm } from "@/components/schedule/schedule-manager";
import { cn } from "@/lib/utils";

// Mock tags
const AVAILABLE_TAGS = ["sightseeing", "food", "move", "Munich", "Vienna", "Puhga"];

// Mock Data - using fixed dates to prevent hydration mismatch
const MOCK_SCHEDULES: Schedule[] = [
  {
    id: "1",
    start_time: "2026-02-14T10:00:00+09:00",
    end_time: "2026-02-14T12:00:00+09:00",
    title: "ウィーン到着・空港移動",
    event_type: "range",
    address: "Vienna International Airport, 1300 Schwechat, Austria",
    tag: ["move", "Vienna"],
    memo: "CAT(シティ・エアポート・トレイン)で市内へ。チケットはオンライン購入済み。",
    created_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "2",
    start_time: "2026-02-14T13:00:00+09:00",
    end_time: "2026-02-14T14:30:00+09:00",
    title: "ランチ @ Figlmüller",
    event_type: "range",
    address: "Wollzeile 5, 1010 Wien, Austria",
    tag: ["food", "Vienna"],
    memo: "シュニッツェルの有名店。予約必須。13:00〜予約済み。",
    created_at: "2026-02-01T00:00:00Z",
  },
  {
    id: "3",
    start_time: "2026-02-14T15:00:00+09:00",
    end_time: "2026-02-14T17:00:00+09:00",
    title: "シュテファン大聖堂 観光",
    event_type: "range",
    address: "Stephansplatz 3, 1010 Wien, Austria",
    tag: ["sightseeing", "Vienna"],
    memo: "南塔の階段を登る。景色が良い。",
    created_at: "2026-02-01T00:00:00Z",
  },
];

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date("2026-02-14"));
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });
  };

  const navigateDay = (offset: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Filter schedules by current date and selected tags
  const filteredSchedules = MOCK_SCHEDULES.filter((schedule) => {
    const scheduleDate = new Date(schedule.start_time);
    const dateMatch =
      scheduleDate.getFullYear() === currentDate.getFullYear() &&
      scheduleDate.getMonth() === currentDate.getMonth() &&
      scheduleDate.getDate() === currentDate.getDate();

    // If no tags selected, show all
    if (selectedTags.length === 0) return dateMatch;

    // OR search: show if any tag matches
    const tagMatch = schedule.tag?.some((t) => selectedTags.includes(t)) || false;
    return dateMatch && tagMatch;
  });

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateDay(-1)}
            className="px-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <h2 className="text-xl font-bold font-serif text-primary">
            {formatDate(currentDate)}
          </h2>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateDay(1)}
            className="px-2"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Tag Filter */}
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                selectedTags.includes(tag)
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "bg-background text-muted-foreground border-input hover:border-secondary"
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        <Timeline items={filteredSchedules} onEdit={openScheduleForm} />

        {/* Add Schedule button in header area */}
        <Button
          variant="gold"
          size="sm"
          className="w-full shadow-sm"
          onClick={() => openScheduleForm()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Schedule
        </Button>
      </div>

      <ScheduleManager />
    </>
  );
}
