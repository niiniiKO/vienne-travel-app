"use client";

import { Wish, Task } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Plus, Calendar as CalendarIcon, MapPin, Copy, Check as CheckIcon, Pencil, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { WishForm } from "@/components/wishes/wish-form";
import { openScheduleForm } from "@/components/schedule/schedule-manager";
import { useUser } from "@/contexts/user-context";
import { supabase } from "@/lib/supabase";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

// Copy button component for address
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
            type="button"
            onClick={handleCopy}
            className="p-1 hover:bg-secondary/20 rounded transition-colors flex-shrink-0"
            title="住所をコピー"
        >
            {copied ? (
                <CheckIcon className="h-3.5 w-3.5 text-green-600" />
            ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
            )}
        </button>
    );
}

type TabType = "tasks" | "wishes";

export default function TasksWishesPage() {
    const { tags } = useUser();
    const [activeTab, setActiveTab] = useState<TabType>("tasks");
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isWishFormOpen, setIsWishFormOpen] = useState(false);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [editingWish, setEditingWish] = useState<Wish | undefined>(undefined);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    
    // Task form state
    const [taskTitle, setTaskTitle] = useState("");
    const [taskMemo, setTaskMemo] = useState("");

    // Fetch data from Supabase
    const fetchData = useCallback(async () => {
        try {
            const [wishesResult, tasksResult] = await Promise.all([
                supabase.from("wishes").select("*").order("created_at", { ascending: false }),
                supabase.from("tasks").select("*").order("created_at", { ascending: false })
            ]);

            // Check for errors with detailed logging
            if (wishesResult.error) {
                console.error("Wishes fetch error:", wishesResult.error.message, wishesResult.error.code);
                // If table doesn't exist, use empty array
                if (wishesResult.error.code === "42P01") {
                    console.warn("wishes table does not exist");
                } else {
                    throw wishesResult.error;
                }
            }
            if (tasksResult.error) {
                console.error("Tasks fetch error:", tasksResult.error.message, tasksResult.error.code);
                // If table doesn't exist, use empty array
                if (tasksResult.error.code === "42P01") {
                    console.warn("tasks table does not exist");
                } else {
                    throw tasksResult.error;
                }
            }

            setWishes(wishesResult.data || []);
            setTasks(tasksResult.data || []);
        } catch (err: unknown) {
            const error = err as { message?: string; code?: string };
            console.error("Failed to fetch data:", error?.message || err, error?.code || "");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = async () => {
        await fetchData();
    };

    // ===== WISH FUNCTIONS =====
    const toggleWishStatus = async (id: string) => {
        const wish = wishes.find(w => w.id === id);
        if (!wish) return;

        const newStatus = wish.status === "want" ? "done" : "want";
        
        try {
            const { error } = await supabase
                .from("wishes")
                .update({ status: newStatus })
                .eq("id", id);
            
            if (error) throw error;
            setWishes(wishes.map(w => w.id === id ? { ...w, status: newStatus } : w));
        } catch (err) {
            console.error("Failed to update wish status:", err);
        }
    };

    const openEditWishForm = (wish: Wish) => {
        setEditingWish(wish);
        setIsWishFormOpen(true);
    };

    const closeWishForm = () => {
        setIsWishFormOpen(false);
        setEditingWish(undefined);
    };

    const handleWishUpdate = async (wishData: Wish) => {
        try {
            const isNew = !wishData.id || wishData.id.startsWith("wish-");
            
            if (isNew) {
                const { data, error } = await supabase
                    .from("wishes")
                    .insert({
                        title: wishData.title,
                        status: wishData.status || "want",
                        tag: wishData.tag,
                        memo: wishData.memo,
                        address: wishData.address,
                    })
                    .select()
                    .single();
                
                if (error) throw error;
                if (data) {
                    setWishes([data, ...wishes]);
                }
            } else {
                const { error } = await supabase
                    .from("wishes")
                    .update({
                        title: wishData.title,
                        status: wishData.status,
                        tag: wishData.tag,
                        memo: wishData.memo,
                        address: wishData.address,
                    })
                    .eq("id", wishData.id);
                
                if (error) throw error;
                setWishes(wishes.map(w => w.id === wishData.id ? wishData : w));
            }
            closeWishForm();
        } catch (err) {
            console.error("Failed to save wish:", err);
            alert("Wishの保存に失敗しました");
        }
    };

    const handleDeleteWish = async () => {
        if (!editingWish) return;
        
        try {
            const { error } = await supabase
                .from("wishes")
                .delete()
                .eq("id", editingWish.id);
            
            if (error) throw error;
            setWishes(wishes.filter(w => w.id !== editingWish.id));
            closeWishForm();
        } catch (err) {
            console.error("Failed to delete wish:", err);
            alert("Wishの削除に失敗しました");
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const filteredWishes = selectedTags.length === 0
        ? wishes
        : wishes.filter((wish) => wish.tag?.some((t) => selectedTags.includes(t)));

    const promoteToSchedule = (wish: Wish) => {
        openScheduleForm({
            id: "",
            title: wish.title,
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            event_type: "point",
            address: wish.address || "",
            tag: wish.tag || [],
            memo: wish.memo ? `From wish list: ${wish.memo}` : `From wish list: ${wish.title}`,
            created_at: new Date().toISOString(),
        });
    };

    // ===== TASK FUNCTIONS =====
    const toggleTaskDone = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newIsDone = !task.is_done;
        
        try {
            const { error } = await supabase
                .from("tasks")
                .update({ is_done: newIsDone })
                .eq("id", id);
            
            if (error) throw error;
            setTasks(tasks.map(t => t.id === id ? { ...t, is_done: newIsDone } : t));
        } catch (err) {
            console.error("Failed to update task:", err);
        }
    };

    const openEditTaskForm = (task: Task) => {
        setEditingTask(task);
        setTaskTitle(task.title);
        setTaskMemo(task.memo || "");
        setIsTaskFormOpen(true);
    };

    const closeTaskForm = () => {
        setIsTaskFormOpen(false);
        setEditingTask(undefined);
        setTaskTitle("");
        setTaskMemo("");
    };

    const handleTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;

        try {
            if (editingTask) {
                const { error } = await supabase
                    .from("tasks")
                    .update({ title: taskTitle, memo: taskMemo || null })
                    .eq("id", editingTask.id);
                
                if (error) throw error;
                setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, title: taskTitle, memo: taskMemo || null } : t));
            } else {
                const { data, error } = await supabase
                    .from("tasks")
                    .insert({
                        title: taskTitle,
                        memo: taskMemo || null,
                        is_done: false,
                    })
                    .select()
                    .single();
                
                if (error) throw error;
                if (data) {
                    setTasks([data, ...tasks]);
                }
            }
            closeTaskForm();
        } catch (err) {
            console.error("Failed to save task:", err);
            alert("タスクの保存に失敗しました");
        }
    };

    const handleTaskDelete = async () => {
        if (!editingTask) return;

        try {
            const { error } = await supabase
                .from("tasks")
                .delete()
                .eq("id", editingTask.id);
            
            if (error) throw error;
            setTasks(tasks.filter(t => t.id !== editingTask.id));
            closeTaskForm();
        } catch (err) {
            console.error("Failed to delete task:", err);
            alert("タスクの削除に失敗しました");
        }
    };

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
                    {/* Tab Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-1 p-1 bg-secondary/10 rounded-lg">
                            <button
                                onClick={() => setActiveTab("tasks")}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                    activeTab === "tasks"
                                        ? "bg-background text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Tasks
                            </button>
                            <button
                                onClick={() => setActiveTab("wishes")}
                                className={cn(
                                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                    activeTab === "wishes"
                                        ? "bg-background text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Wishes
                            </button>
                        </div>
                        <Button 
                            variant="gold" 
                            size="sm" 
                            className="shadow-sm" 
                            onClick={() => activeTab === "tasks" ? setIsTaskFormOpen(true) : setIsWishFormOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add {activeTab === "tasks" ? "Task" : "Wish"}
                        </Button>
                    </div>

                    {/* Tasks Tab Content */}
                    {activeTab === "tasks" && (
                        <div className="grid gap-3">
                            {tasks.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>タスクがまだありません</p>
                                </div>
                            ) : (
                                tasks.map((task) => (
                                    <Card 
                                        key={task.id} 
                                        className={cn(
                                            "transition-opacity cursor-pointer hover:shadow-md", 
                                            task.is_done && "opacity-60"
                                        )}
                                        onClick={() => toggleTaskDone(task.id)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                {/* Visual Check Status */}
                                                <div
                                                    className={cn(
                                                        "h-6 w-6 rounded-full border border-primary flex items-center justify-center transition-colors flex-shrink-0 mt-0.5",
                                                        task.is_done ? "bg-primary text-primary-foreground" : "text-transparent"
                                                    )}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className={cn("font-medium text-lg leading-tight", task.is_done && "line-through text-muted-foreground")}>
                                                        {task.title}
                                                    </h3>
                                                    {task.memo && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {task.memo}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Edit Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditTaskForm(task);
                                                    }}
                                                    className="p-1 hover:bg-secondary/20 rounded transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}

                    {/* Wishes Tab Content */}
                    {activeTab === "wishes" && (
                        <div className="space-y-4">
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

                            <div className="grid gap-4">
                                {filteredWishes.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <p>Wishがまだありません</p>
                                    </div>
                                ) : (
                                    filteredWishes.map((wish) => (
                                        <Card 
                                            key={wish.id} 
                                            className={cn(
                                                "transition-opacity cursor-pointer hover:shadow-md", 
                                                wish.status === "done" && "opacity-60"
                                            )}
                                            onClick={() => toggleWishStatus(wish.id)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <div
                                                            className={cn(
                                                                "h-6 w-6 rounded-full border border-primary flex items-center justify-center transition-colors flex-shrink-0 mt-0.5",
                                                                wish.status === "done" ? "bg-primary text-primary-foreground" : "text-transparent"
                                                            )}
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 space-y-1.5">
                                                            <h3 className={cn("font-medium text-lg leading-tight", wish.status === "done" && "line-through text-muted-foreground")}>
                                                                {wish.title}
                                                            </h3>
                                                            {wish.tag && wish.tag.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {wish.tag.map((t) => (
                                                                        <span
                                                                            key={t}
                                                                            className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground"
                                                                        >
                                                                            {t}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {wish.memo && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {wish.memo}
                                                                </p>
                                                            )}
                                                            {wish.address && (
                                                                <div className="flex items-center gap-1.5 text-sm min-w-0">
                                                                    <a
                                                                        href={`geo:0,0?q=${encodeURIComponent(wish.address)}`}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="flex items-center gap-1 text-primary hover:text-primary/80 underline underline-offset-2 flex-1 min-w-0"
                                                                    >
                                                                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                                                        <span className="truncate">{wish.address}</span>
                                                                    </a>
                                                                    <CopyButton text={wish.address} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                                        {wish.status === "want" && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    promoteToSchedule(wish);
                                                                }}
                                                                className="h-8 w-8 p-0"
                                                                title="Add to Schedule"
                                                            >
                                                                <CalendarIcon className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditWishForm(wish);
                                                            }}
                                                            className="h-8 w-8 flex items-center justify-center hover:bg-secondary/20 rounded transition-colors text-muted-foreground hover:text-foreground"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </PullToRefresh>

            {/* Wish Form Modal */}
            <Modal isOpen={isWishFormOpen} onClose={closeWishForm} title={editingWish ? "Edit Wish" : "Add Wish"}>
                <WishForm 
                    onSuccess={closeWishForm} 
                    initialData={editingWish} 
                    onDelete={handleDeleteWish}
                    onUpdate={handleWishUpdate}
                />
            </Modal>

            {/* Task Form Modal */}
            <Modal isOpen={isTaskFormOpen} onClose={closeTaskForm} title={editingTask ? "Edit Task" : "Add Task"}>
                <form onSubmit={handleTaskSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title *</label>
                        <input
                            type="text"
                            placeholder="e.g., パスポートのコピーを用意"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Memo</label>
                        <textarea
                            className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                            placeholder="メモ・注意事項など"
                            value={taskMemo}
                            onChange={(e) => setTaskMemo(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" variant="gold" className="flex-1" size="lg">
                            {editingTask ? "Update Task" : "Add Task"}
                        </Button>
                        {editingTask && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="lg"
                                onClick={handleTaskDelete}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </form>
            </Modal>
        </>
    );
}
