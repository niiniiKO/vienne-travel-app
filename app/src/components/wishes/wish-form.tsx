"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wish } from "@/types/database";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";

interface WishFormProps {
    className?: string;
    onSuccess?: () => void;
    onDelete?: () => void;
    onUpdate?: (wish: Wish) => void;
    initialData?: Wish;
}

export function WishForm({ className, onSuccess, onDelete, onUpdate, initialData }: WishFormProps) {
    const { tags } = useUser();
    const [title, setTitle] = useState(initialData?.title || "");
    const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tag || []);
    const [memo, setMemo] = useState(initialData?.memo || "");
    const [address, setAddress] = useState(initialData?.address || "");

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const wishData: Wish = {
            id: initialData?.id || `wish-${Date.now()}`,
            title,
            tag: selectedTags,
            memo,
            address,
            status: initialData?.status || "want",
            created_at: initialData?.created_at || new Date().toISOString(),
        };

        if (onUpdate) {
            onUpdate(wishData);
        } else {
            console.log(wishData);
            alert(initialData ? "Wish updated (mock)!" : "Wish added (mock)!");
            onSuccess?.();
        }
    };

    const handleDelete = () => {
        if (confirm("このWishを削除しますか?")) {
            // TODO: Backend integration
            console.log("Delete wish:", initialData?.id);
            alert("Wish deleted (mock)!");
            onDelete?.();
            onSuccess?.();
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
            <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                    placeholder="e.g., カフェ・ザッハでザッハトルテ"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
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
                    {initialData ? "Update Wish" : "Add Wish"}
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
