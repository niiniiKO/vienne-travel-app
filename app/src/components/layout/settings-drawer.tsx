"use client";

import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { X, LogOut, User, Plus, Trash2, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface SettingsDrawerProps {
    open: boolean;
    onClose: () => void;
}

// Mock tags - これは後でSupabaseから取得する
const INITIAL_TAGS = ["sightseeing", "food", "move", "Munich", "Vienna", "Puhga"];

export function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
    const { currentUser, setCurrentUser } = useUser();
    const router = useRouter();
    const [tags, setTags] = useState<string[]>(INITIAL_TAGS);
    const [newTag, setNewTag] = useState("");
    const [editingTag, setEditingTag] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState("");

    const handleSwitchUser = () => {
        setCurrentUser(null);
        onClose();
        router.push("/select-user");
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag("");
            // TODO: Backend integration
            console.log("Added tag:", newTag.trim());
        }
    };

    const handleDeleteTag = (tag: string) => {
        if (confirm(`タグ "${tag}" を削除しますか?`)) {
            setTags(tags.filter((t) => t !== tag));
            // TODO: Backend integration
            console.log("Deleted tag:", tag);
        }
    };

    const handleStartEdit = (tag: string) => {
        setEditingTag(tag);
        setEditingValue(tag);
    };

    const handleSaveEdit = () => {
        if (editingTag && editingValue.trim() && !tags.includes(editingValue.trim())) {
            setTags(tags.map((t) => (t === editingTag ? editingValue.trim() : t)));
            setEditingTag(null);
            setEditingValue("");
            // TODO: Backend integration
            console.log("Updated tag:", editingTag, "->", editingValue.trim());
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
                            />
                            <Button
                                size="sm"
                                variant="gold"
                                onClick={handleAddTag}
                                disabled={!newTag.trim()}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Tag List */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {tags.map((tag) => (
                                <div
                                    key={tag}
                                    className="flex items-center gap-2 p-2 bg-secondary/5 rounded-md border border-border hover:bg-secondary/10 transition-colors"
                                >
                                    {editingTag === tag ? (
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
                                            />
                                            <button
                                                onClick={handleSaveEdit}
                                                className="p-1 hover:bg-green-100 rounded text-green-600"
                                                title="保存"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="p-1 hover:bg-gray-100 rounded text-gray-600"
                                                title="キャンセル"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-1 text-sm font-medium">{tag}</span>
                                            <button
                                                onClick={() => handleStartEdit(tag)}
                                                className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                                title="編集"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTag(tag)}
                                                className="p-1 hover:bg-red-100 rounded text-red-600"
                                                title="削除"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
