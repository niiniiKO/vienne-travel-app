"use client";

import { Wish } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Plus, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { WishForm } from "@/components/wishes/wish-form";
import { openScheduleForm } from "@/components/schedule/schedule-manager";

// Mock tags
const AVAILABLE_TAGS = ["sightseeing", "food", "move", "Munich", "Vienna", "Puhga"];

// Mock Data
const MOCK_WISHES: Wish[] = [
    { id: "w1", title: "カフェ・ザッハでザッハトルテ", status: "want", tag: ["food", "Vienna"], memo: "ウィーンの定番スイーツ", address: "Philharmoniker Str. 4, 1010 Wien", created_at: "" },
    { id: "w2", title: "ベルヴェデーレ宮殿 (クリムト)", status: "want", tag: ["sightseeing", "Vienna"], memo: "「接吻」を見る", address: "Prinz Eugen-Straße 27, 1030 Wien", created_at: "" },
    { id: "w3", title: "ウィーン国立歌劇場 (立ち見)", status: "done", tag: ["sightseeing", "Vienna"], memo: "", address: "Opernring 2, 1010 Wien", created_at: "" },
    { id: "w4", title: "Plachutta (ターフェルシュピッツ)", status: "want", tag: ["food", "Vienna"], memo: "ウィーン伝統料理", address: "Wollzeile 38, 1010 Wien", created_at: "" },
];

export default function WishesPage() {
    const [wishes, setWishes] = useState(MOCK_WISHES);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingWish, setEditingWish] = useState<Wish | undefined>(undefined);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const toggleStatus = (id: string) => {
        setWishes(wishes.map(w => w.id === id ? { ...w, status: w.status === "want" ? "done" : "want" } : w));
    };

    const openEditForm = (wish: Wish) => {
        setEditingWish(wish);
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingWish(undefined);
    };

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    // Filter wishes by selected tags
    const filteredWishes = selectedTags.length === 0
        ? wishes
        : wishes.filter((wish) => wish.tag?.some((t) => selectedTags.includes(t)));

    const promoteToSchedule = (wish: Wish) => {
        // Open schedule form with wish data pre-filled
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

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold font-serif text-primary">Wish List</h2>
                    <Button variant="gold" size="sm" className="shadow-sm" onClick={() => setIsFormOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Wish
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

                <div className="grid gap-4">
                    {filteredWishes.map((wish) => (
                        <Card 
                            key={wish.id} 
                            className={cn(
                                "transition-opacity cursor-pointer hover:shadow-md", 
                                wish.status === "done" && "opacity-60"
                            )}
                            onClick={() => openEditForm(wish)}
                        >
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleStatus(wish.id);
                                        }}
                                        className={cn(
                                            "h-6 w-6 rounded-full border border-primary flex items-center justify-center transition-colors flex-shrink-0",
                                            wish.status === "done" ? "bg-primary text-primary-foreground" : "text-transparent"
                                        )}
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={cn("font-medium text-lg leading-tight", wish.status === "done" && "line-through text-muted-foreground")}>
                                            {wish.title}
                                        </h3>
                                        {wish.tag && wish.tag.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
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
                                        className="ml-2 flex-shrink-0"
                                        title="Add to Schedule"
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Modal isOpen={isFormOpen} onClose={closeForm} title={editingWish ? "Edit Wish" : "Add Wish"}>
                <WishForm onSuccess={closeForm} initialData={editingWish} />
            </Modal>
        </>
    );
}
