"use client";

import { Wish, Task } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Plus, Calendar as CalendarIcon, MapPin, Copy, Check as CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { WishForm } from "@/components/wishes/wish-form";
import { openScheduleForm } from "@/components/schedule/schedule-manager";
import { useUser } from "@/contexts/user-context";

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

// Mock Data - Wishes
const MOCK_WISHES: Wish[] = [
    { id: "w1", title: "カフェ・ザッハでザッハトルテ", status: "want", tag: ["food", "Vienna"], memo: "ウィーンの定番スイーツ", address: "Philharmoniker Str. 4, 1010 Wien", created_at: "" },
    { id: "w2", title: "ベルヴェデーレ宮殿 (クリムト)", status: "want", tag: ["sightseeing", "Vienna"], memo: "「接吻」を見る", address: "Prinz Eugen-Straße 27, 1030 Wien", created_at: "" },
    { id: "w3", title: "ウィーン国立歌劇場 (立ち見)", status: "done", tag: ["sightseeing", "Vienna"], memo: "", address: "Opernring 2, 1010 Wien", created_at: "" },
    { id: "w4", title: "Plachutta (ターフェルシュピッツ)", status: "want", tag: ["food", "Vienna"], memo: "ウィーン伝統料理", address: "Wollzeile 38, 1010 Wien", created_at: "" },
];

// Mock Data - Tasks
const MOCK_TASKS: Task[] = [
    { id: "t1", title: "パスポートコピーを用意", memo: "ホテルチェックイン時に必要", is_done: true, created_at: "" },
    { id: "t2", title: "海外旅行保険に加入", memo: "", is_done: false, created_at: "" },
    { id: "t3", title: "ユーロを両替", memo: "空港で5万円分", is_done: false, created_at: "" },
    { id: "t4", title: "WiFiルーターをレンタル", memo: "受け取り場所を確認", is_done: false, created_at: "" },
];

type TabType = "tasks" | "wishes";

export default function TasksWishesPage() {
    const { tags } = useUser();
    const [activeTab, setActiveTab] = useState<TabType>("tasks");
    const [wishes, setWishes] = useState(MOCK_WISHES);
    const [tasks, setTasks] = useState(MOCK_TASKS);
    const [isWishFormOpen, setIsWishFormOpen] = useState(false);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [editingWish, setEditingWish] = useState<Wish | undefined>(undefined);
    const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    
    // Task form state
    const [taskTitle, setTaskTitle] = useState("");
    const [taskMemo, setTaskMemo] = useState("");

    // Wish functions
    const toggleWishStatus = (id: string) => {
        setWishes(wishes.map(w => w.id === id ? { ...w, status: w.status === "want" ? "done" : "want" } : w));
    };

    const openEditWishForm = (wish: Wish) => {
        setEditingWish(wish);
        setIsWishFormOpen(true);
    };

    const closeWishForm = () => {
        setIsWishFormOpen(false);
        setEditingWish(undefined);
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

    // Task functions
    const toggleTaskDone = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, is_done: !t.is_done } : t));
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

    const handleTaskSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;

        if (editingTask) {
            setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, title: taskTitle, memo: taskMemo || null } : t));
        } else {
            const newTask: Task = {
                id: `task-${Date.now()}`,
                title: taskTitle,
                memo: taskMemo || null,
                is_done: false,
                created_at: new Date().toISOString(),
            };
            setTasks([newTask, ...tasks]);
        }
        closeTaskForm();
    };

    const handleTaskDelete = () => {
        if (editingTask && confirm("このタスクを削除しますか?")) {
            setTasks(tasks.filter(t => t.id !== editingTask.id));
            closeTaskForm();
        }
    };

    return (
        <>
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
                                    onClick={() => openEditTaskForm(task)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleTaskDone(task.id);
                                                }}
                                                className={cn(
                                                    "h-6 w-6 rounded-full border border-primary flex items-center justify-center transition-colors flex-shrink-0 mt-0.5",
                                                    task.is_done ? "bg-primary text-primary-foreground" : "text-transparent"
                                                )}
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
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
                            {filteredWishes.map((wish) => (
                                <Card 
                                    key={wish.id} 
                                    className={cn(
                                        "transition-opacity cursor-pointer hover:shadow-md", 
                                        wish.status === "done" && "opacity-60"
                                    )}
                                    onClick={() => openEditWishForm(wish)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-3 flex-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleWishStatus(wish.id);
                                                    }}
                                                    className={cn(
                                                        "h-6 w-6 rounded-full border border-primary flex items-center justify-center transition-colors flex-shrink-0 mt-0.5",
                                                        wish.status === "done" ? "bg-primary text-primary-foreground" : "text-transparent"
                                                    )}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
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
                                                        <div className="flex items-center gap-1.5 text-sm">
                                                            <a
                                                                href={`geo:0,0?q=${encodeURIComponent(wish.address)}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="flex items-center gap-1 text-primary hover:text-primary/80 underline underline-offset-2"
                                                            >
                                                                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                                                <span className="truncate">{wish.address}</span>
                                                            </a>
                                                            <CopyButton text={wish.address} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {wish.status === "want" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        promoteToSchedule(wish);
                                                    }}
                                                    className="flex-shrink-0"
                                                    title="Add to Schedule"
                                                >
                                                    <CalendarIcon className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Wish Form Modal */}
            <Modal isOpen={isWishFormOpen} onClose={closeWishForm} title={editingWish ? "Edit Wish" : "Add Wish"}>
                <WishForm onSuccess={closeWishForm} initialData={editingWish} />
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
                                Delete
                            </Button>
                        )}
                    </div>
                </form>
            </Modal>
        </>
    );
}
