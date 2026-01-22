"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info } from "@/types/database";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoFormProps {
    className?: string;
    onSuccess?: () => void;
    onDelete?: () => void;
    initialData?: Info;
}

export function InfoForm({ className, onSuccess, onDelete, initialData }: InfoFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [contentText, setContentText] = useState(initialData?.content_text || "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // TODO: Backend integration
        console.log({
            id: initialData?.id || `info-${Date.now()}`,
            title,
            content_text: contentText,
            content_html: null,
            created_at: initialData?.created_at || new Date().toISOString(),
        });

        alert(initialData ? "Info updated (mock)!" : "Info added (mock)!");
        onSuccess?.();
    };

    const handleDelete = () => {
        if (confirm("この情報を削除しますか?")) {
            // TODO: Backend integration
            console.log("Delete info:", initialData?.id);
            alert("Info deleted (mock)!");
            onDelete?.();
            onSuccess?.();
        }
    };

    return (
        <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
            <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                    placeholder="e.g., ウィーンの公共交通機関"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <textarea
                    className="w-full min-h-[200px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    placeholder="情報の内容を入力..."
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                />
            </div>

            <div className="flex gap-2">
                <Button type="submit" variant="gold" className="flex-1" size="lg">
                    {initialData ? "Update Info" : "Add Info"}
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
