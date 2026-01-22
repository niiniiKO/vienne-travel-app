"use client";

import { useState, useEffect, useCallback } from "react";
import { Info } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { InfoForm } from "@/components/info/info-form";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

export default function InfoPage() {
    const [infos, setInfos] = useState<Info[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchInfos = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("infos")
                .select("*")
                .order("created_at", { ascending: false });
            
            if (error) throw error;
            setInfos(data || []);
        } catch (err) {
            console.error("Failed to fetch infos:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInfos();
    }, [fetchInfos]);

    const handleRefresh = async () => {
        await fetchInfos();
    };

    const closeForm = () => {
        setIsFormOpen(false);
    };

    const handleInfoCreated = (newInfo: Info) => {
        setInfos([newInfo, ...infos]);
        closeForm();
    };

    const handleDeleteInfo = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("この情報を削除しますか?")) {
            try {
                const { error } = await supabase
                    .from("infos")
                    .delete()
                    .eq("id", id);
                
                if (error) throw error;
                setInfos(infos.filter(info => info.id !== id));
            } catch (err) {
                console.error("Failed to delete info:", err);
                alert("情報の削除に失敗しました");
            }
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
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold font-serif text-primary">Information</h2>
                        <Button
                            variant="gold"
                            size="sm"
                            onClick={() => setIsFormOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Info
                        </Button>
                    </div>

                    {infos.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>情報がまだ登録されていません</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {infos.map((info) => (
                                <Link key={info.id} href={`/info/${info.id}`}>
                                    <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-secondary/10">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-lg leading-tight mb-1">
                                                        {info.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {info.content_text || (info.content_html ? "HTML コンテンツ" : "内容なし")}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(info.created_at).toLocaleDateString("ja-JP")}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => handleDeleteInfo(info.id, e)}
                                                    className="p-2 hover:bg-red-50 rounded transition-colors text-muted-foreground hover:text-red-600 flex-shrink-0"
                                                    title="削除"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </PullToRefresh>

            <Modal isOpen={isFormOpen} onClose={closeForm} title="Add Info">
                <InfoForm onSuccess={closeForm} onCreated={handleInfoCreated} />
            </Modal>
        </>
    );
}
