"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info } from "@/types/database";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

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
    const [contentText, setContentText] = useState(initialData?.content_text || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (initialData) {
                // Update existing info
                const { error } = await supabase
                    .from("infos")
                    .update({
                        title,
                        content_text: contentText || null,
                    })
                    .eq("id", initialData.id);
                
                if (error) throw error;
                
                const updatedInfo: Info = {
                    ...initialData,
                    title,
                    content_text: contentText || null,
                };
                onUpdated?.(updatedInfo);
            } else {
                // Create new info
                const { data, error } = await supabase
                    .from("infos")
                    .insert({
                        title,
                        content_text: contentText || null,
                    })
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
                <label className="text-sm font-medium">Content</label>
                <textarea
                    className="w-full min-h-[200px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                    placeholder="情報の内容を入力..."
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
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
