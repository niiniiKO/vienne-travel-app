"use client";

import { useState, useEffect, useCallback } from "react";
import { Timeline } from "@/components/schedule/timeline";
import { Schedule } from "@/types/database";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { ScheduleManager, openScheduleForm } from "@/components/schedule/schedule-manager";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";
import { supabase } from "@/lib/supabase";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

// Extended type for display with date-crossing info
export interface DisplaySchedule extends Schedule {
  isContinuedFromPreviousDay?: boolean;
  originalSchedule?: Schedule;
}

// Helper to get date string in CET timezone
const getDateInCET = (date: Date): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Vienna',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

export default function Home() {
  const { tags } = useUser();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    const targetDate = new Date("2026-02-17");
    // 現在の日付が2月17日以前なら2月17日、以降なら現在の日付を表示
    return today < targetDate ? targetDate : today;
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch schedules from Supabase
  const fetchSchedules = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    await fetchSchedules();
  };

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

  // Handle schedule update (add or edit) - save to Supabase
  const handleScheduleUpdate = async (schedule: Schedule) => {
    try {
      const isNew = !schedule.id || schedule.id.startsWith("schedule-");
      
      if (isNew) {
        // Create new schedule - extract only the fields we need
        // Note: Some columns may need to be added to Supabase database
        const insertData: Record<string, unknown> = {
          title: schedule.title,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
        };
        
        // Add optional fields if they have values
        if (schedule.address) insertData.address = schedule.address;
        if (schedule.tag && schedule.tag.length > 0) insertData.tag = schedule.tag;
        if (schedule.memo) insertData.memo = schedule.memo;
        if (schedule.event_type) insertData.event_type = schedule.event_type;
        
        const { data, error } = await supabase
          .from("schedules")
          .insert(insertData)
          .select()
          .single();
        
        if (error) throw error;
        if (data) {
          setSchedules(prev => [...prev, data]);
        }
      } else {
        // Update existing schedule
        // Note: Some columns may need to be added to Supabase database
        const updateData: Record<string, unknown> = {
          title: schedule.title,
          start_time: schedule.start_time,
          end_time: schedule.end_time,
        };
        
        // Add optional fields
        if (schedule.address !== undefined) updateData.address = schedule.address;
        if (schedule.tag !== undefined) updateData.tag = schedule.tag;
        if (schedule.memo !== undefined) updateData.memo = schedule.memo;
        if (schedule.event_type !== undefined) updateData.event_type = schedule.event_type;
        
        const { error } = await supabase
          .from("schedules")
          .update(updateData)
          .eq("id", schedule.id);
        
        if (error) throw error;
        setSchedules(prev => prev.map(s => s.id === schedule.id ? schedule : s));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      console.error("Failed to save schedule:", errorMessage, err);
      alert(`スケジュールの保存に失敗しました: ${errorMessage}`);
    }
  };

  // Handle schedule delete - delete from Supabase
  const handleScheduleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete schedule:", err);
      alert("スケジュールの削除に失敗しました");
    }
  };

  // Filter schedules by current date and selected tags
  // Also include date-crossing events that END on currentDate
  const filteredSchedules: DisplaySchedule[] = (() => {
    const currentDateStr = getDateInCET(currentDate);
    
    // Events that START on current date (normal display)
    const startingOnCurrentDate = schedules.filter((schedule) => {
      const startDateStr = getDateInCET(new Date(schedule.start_time));
      return startDateStr === currentDateStr;
    }).map(schedule => ({
      ...schedule,
      isContinuedFromPreviousDay: false,
      originalSchedule: schedule
    }));

    // Events that cross dates: START before currentDate AND END on currentDate
    const crossingEvents = schedules.filter((schedule) => {
      const startDateStr = getDateInCET(new Date(schedule.start_time));
      const endDateStr = getDateInCET(new Date(schedule.end_time));
      // Starts before current date and ends on current date
      return startDateStr !== currentDateStr && endDateStr === currentDateStr;
    }).map(schedule => ({
      ...schedule,
      isContinuedFromPreviousDay: true,
      originalSchedule: schedule
    }));

    // Combine: crossing events first (sorted by end_time), then normal events (sorted by start_time)
    const combined = [
      ...crossingEvents.sort((a, b) => new Date(a.end_time).getTime() - new Date(b.end_time).getTime()),
      ...startingOnCurrentDate.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    ];

    // Apply tag filter
    if (selectedTags.length === 0) return combined;
    return combined.filter(schedule => 
      schedule.tag?.some((t) => selectedTags.includes(t)) || false
    );
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh}>
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
            {tags.map((tag) => (
              <button
                key={tag.id}
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

          <Timeline 
            items={filteredSchedules} 
            onEdit={(schedule) => {
              // For date-crossing events, pass the original schedule for editing
              const displaySchedule = schedule as DisplaySchedule;
              openScheduleForm(displaySchedule.originalSchedule || schedule);
            }} 
          />

          {/* Add Schedule button in header area */}
          <Button
            variant="gold"
            size="sm"
            className="w-full shadow-sm"
            onClick={() => openScheduleForm(undefined, currentDate.toISOString().split("T")[0])}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Schedule
          </Button>
        </div>
      </PullToRefresh>

      <ScheduleManager onUpdate={handleScheduleUpdate} onDelete={handleScheduleDelete} />
    </>
  );
}
