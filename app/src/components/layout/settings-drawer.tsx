"use client";

import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { X, LogOut, User, Plus, Trash2, Edit2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Tag } from "@/types/database";

interface SettingsDrawerProps {
    open: boolean;
    onClose: () => void;
}

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
    const { currentUser, setCurrentUser, refreshTags: refreshGlobalTags } = useUser();
    const router = useRouter();
    const [tags, setTags] = useState<Tag[]>([]);
    const [newTag, setNewTag] = useState("");
    const [editingTag, setEditingTag] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch tags from Supabase
    const fetchTags = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("tags")
                .select("*")
                .order("name");
            
            if (error) throw error;
            setTags(data || []);
        } catch (err) {
            console.error("Failed to fetch tags:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (open) {
            fetchTags();
        }
    }, [open, fetchTags]);

    const handleSwitchUser = () => {
        setCurrentUser(null);
        onClose();
        router.push("/select-user");
    };

    const handleAddTag = async () => {
        const trimmedTag = newTag.trim();
        if (!trimmedTag || tags.some(t => t.name === trimmedTag)) return;
        
        setSaving(true);
        try {
            const { data, error } = await supabase
                .from("tags")
                .insert({ name: trimmedTag })
                .select()
                .single();
            
            if (error) throw error;
            setTags([...tags, data]);
            setNewTag("");
            // Update global tags context
            await refreshGlobalTags();
        } catch (err) {
            console.error("Failed to add tag:", err);
            alert("タグの追加に失敗しました");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTag = async (tag: Tag) => {
        if (!confirm(`タグ "${tag.name}" を削除しますか?`)) return;
        
        setSaving(true);
        try {
            const { error } = await supabase
                .from("tags")
                .delete()
                .eq("id", tag.id);
            
            if (error) throw error;
            setTags(tags.filter((t) => t.id !== tag.id));
            // Update global tags context
            await refreshGlobalTags();
        } catch (err) {
            console.error("Failed to delete tag:", err);
            alert("タグの削除に失敗しました");
        } finally {
            setSaving(false);
        }
    };

    const handleStartEdit = (tag: Tag) => {
        setEditingTag(tag.id);
        setEditingValue(tag.name);
    };

    const handleSaveEdit = async () => {
        const trimmedValue = editingValue.trim();
        if (!editingTag || !trimmedValue) return;
        if (tags.some(t => t.name === trimmedValue && t.id !== editingTag)) return;
        
        setSaving(true);
        try {
            const { error } = await supabase
                .from("tags")
                .update({ name: trimmedValue })
                .eq("id", editingTag);
            
            if (error) throw error;
            setTags(tags.map((t) => (t.id === editingTag ? { ...t, name: trimmedValue } : t)));
            setEditingTag(null);
            setEditingValue("");
            // Update global tags context
            await refreshGlobalTags();
        } catch (err) {
            console.error("Failed to update tag:", err);
            alert("タグの更新に失敗しました");
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingTag(null);
        setEditingValue("");
    };

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l border-border z-50 animate-in slide-in-from-right overflow-y-auto">
                <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background z-10">
                    <h2 className="text-lg font-bold font-serif text-primary">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary/10 rounded-md transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Current User */}
                    <div className="p-4 bg-secondary/10 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">現在のユーザー</p>
                                <p className="font-bold">{currentUser?.name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Switch User Button */}
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={handleSwitchUser}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        ユーザーを変更
                    </Button>

                    {/* Tag Management */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-primary">タグ管理</h3>
                        
                        {/* Add New Tag */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="新しいタグ"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleAddTag();
                                    }
                                }}
                                className="flex-1"
                                disabled={saving}
                            />
                            <Button
                                size="sm"
                                variant="gold"
                                onClick={handleAddTag}
                                disabled={!newTag.trim() || saving}
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            </Button>
                        </div>

                        {/* Tag List */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : tags.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">タグがありません</p>
                            ) : (
                                tags.map((tag) => (
                                    <div
                                        key={tag.id}
                                        className="flex items-center gap-2 p-2 bg-secondary/5 rounded-md border border-border hover:bg-secondary/10 transition-colors"
                                    >
                                        {editingTag === tag.id ? (
                                            <>
                                                <Input
                                                    value={editingValue}
                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            handleSaveEdit();
                                                        } else if (e.key === "Escape") {
                                                            handleCancelEdit();
                                                        }
                                                    }}
                                                    className="flex-1 h-7 text-sm"
                                                    autoFocus
                                                    disabled={saving}
                                                />
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="p-1 hover:bg-green-100 rounded text-green-600"
                                                    title="保存"
                                                    disabled={saving}
                                                >
                                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="p-1 hover:bg-gray-100 rounded text-gray-600"
                                                    title="キャンセル"
                                                    disabled={saving}
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span className="flex-1 text-sm font-medium">{tag.name}</span>
                                                <button
                                                    onClick={() => handleStartEdit(tag)}
                                                    className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                                    title="編集"
                                                    disabled={saving}
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTag(tag)}
                                                    className="p-1 hover:bg-red-100 rounded text-red-600"
                                                    title="削除"
                                                    disabled={saving}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
