"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wish } from "@/types/database";
import { Trash2, ExternalLink, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WishFormProps {
    className?: string;
    onSuccess?: () => void;
    onDelete?: () => void;
    initialData?: Wish;
}

// Mock tags - これは後でSupabaseから取得する
const AVAILABLE_TAGS = ["sightseeing", "food", "move", "Munich", "Vienna", "Puhga"];

// Copy button component
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
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
            className="p-1.5 hover:bg-secondary/20 rounded transition-colors flex-shrink-0"
            title="住所をコピー"
        >
            {copied ? (
                <Check className="h-4 w-4 text-green-600" />
            ) : (
                <Copy className="h-4 w-4 text-muted-foreground hover:text-primary" />
            )}
        </button>
    );
}

export function WishForm({ className, onSuccess, onDelete, initialData }: WishFormProps) {
    const [title, setTitle] = React.useState(initialData?.title || "");
    const [selectedTags, setSelectedTags] = React.useState<string[]>(initialData?.tag || []);
    const [memo, setMemo] = React.useState(initialData?.memo || "");
    const [address, setAddress] = React.useState(initialData?.address || "");

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // TODO: Backend integration
        console.log({
            id: initialData?.id || `wish-${Date.now()}`,
            title,
            tag: selectedTags,
            memo,
            address,
            status: initialData?.status || "want",
            created_at: initialData?.created_at || new Date().toISOString(),
        });

        alert(initialData ? "Wish updated (mock)!" : "Wish added (mock)!");
        onSuccess?.();
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
                    {AVAILABLE_TAGS.map((tag) => (
                        <button
                            key={tag}
                            type="button"
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
                {address && (
                    <div className="flex items-center gap-2 pt-1">
                        <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 underline underline-offset-2"
                        >
                            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                            Open in Map
                        </a>
                        <CopyButton text={address} />
                    </div>
                )}
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
