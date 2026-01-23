"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info } from "@/types/database";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type ContentType = "text" | "html";

interface InfoFormProps {
    className?: string;
    onSuccess?: () => void;
    onDelete?: () => void;
    onCreated?: (info: Info) => void;
    onUpdated?: (info: Info) => void;
    initialData?: Info;
}

export function InfoForm({ className, onSuccess, onDelete, onCreated, onUpdated, initialData }: InfoFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    // Determine initial content type based on existing data
    const initialContentType: ContentType = initialData?.content_html ? "html" : "text";
    const [contentType, setContentType] = useState<ContentType>(initialContentType);
    const [content, setContent] = useState(
        initialData?.content_html || initialData?.content_text || ""
    );
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const contentData = {
                title,
                content_text: contentType === "text" ? (content || null) : null,
                content_html: contentType === "html" ? (content || null) : null,
            };

            if (initialData) {
                // Update existing info
                const { error } = await supabase
                    .from("infos")
                    .update(contentData)
                    .eq("id", initialData.id);
                
                if (error) throw error;
                
                const updatedInfo: Info = {
                    ...initialData,
                    ...contentData,
                };
                onUpdated?.(updatedInfo);
            } else {
                // Create new info
                const { data, error } = await supabase
                    .from("infos")
                    .insert(contentData)
                    .select()
                    .single();
                
                if (error) throw error;
                if (data) {
                    onCreated?.(data);
                }
            }
            onSuccess?.();
        } catch (err) {
            console.error("Failed to save info:", err);
            alert("情報の保存に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialData) return;
        if (!confirm("この情報を削除しますか?")) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from("infos")
                .delete()
                .eq("id", initialData.id);
            
            if (error) throw error;
            onDelete?.();
            onSuccess?.();
        } catch (err) {
            console.error("Failed to delete info:", err);
            alert("情報の削除に失敗しました");
        } finally {
            setLoading(false);
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
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Content Type</label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setContentType("text")}
                        className={cn(
                            "flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors border",
                            contentType === "text"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-input hover:border-primary"
                        )}
                        disabled={loading}
                    >
                        テキスト
                    </button>
                    <button
                        type="button"
                        onClick={() => setContentType("html")}
                        className={cn(
                            "flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors border",
                            contentType === "html"
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground border-input hover:border-primary"
                        )}
                        disabled={loading}
                    >
                        HTML
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">
                    Content {contentType === "html" && <span className="text-xs text-muted-foreground">(HTMLタグが使えます)</span>}
                </label>
                <textarea
                    className={cn(
                        "w-full min-h-[200px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none",
                        contentType === "html" && "font-mono text-xs"
                    )}
                    placeholder={contentType === "html" ? "<h2>見出し</h2>\n<p>本文...</p>" : "情報の内容を入力..."}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="flex gap-2">
                <Button type="submit" variant="gold" className="flex-1" size="lg" disabled={loading}>
                    {loading ? "処理中..." : (initialData ? "Update Info" : "Add Info")}
                </Button>
                {initialData && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={loading}
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </form>
    );
}
