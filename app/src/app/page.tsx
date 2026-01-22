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

export default function Home() {
  const { tags } = useUser();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date("2026-02-14"));
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
        // Create new schedule
        const { id, ...scheduleWithoutId } = schedule;
        const { data, error } = await supabase
          .from("schedules")
          .insert(scheduleWithoutId)
          .select()
          .single();
        
        if (error) throw error;
        setSchedules(prev => [...prev, data]);
      } else {
        // Update existing schedule
        const { error } = await supabase
          .from("schedules")
          .update({
            title: schedule.title,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            event_type: schedule.event_type,
            address: schedule.address,
            tag: schedule.tag,
            memo: schedule.memo,
          })
          .eq("id", schedule.id);
        
        if (error) throw error;
        setSchedules(prev => prev.map(s => s.id === schedule.id ? schedule : s));
      }
    } catch (err) {
      console.error("Failed to save schedule:", err);
      alert("スケジュールの保存に失敗しました");
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
  const filteredSchedules = schedules.filter((schedule) => {
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
      </PullToRefresh>

      <ScheduleManager onUpdate={handleScheduleUpdate} onDelete={handleScheduleDelete} />
    </>
  );
}
