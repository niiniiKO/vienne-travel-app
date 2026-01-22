"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Info } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/ui/modal";
import { InfoForm } from "@/components/info/info-form";

export default function InfoDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [info, setInfo] = useState<Info | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);

    useEffect(() => {
        async function fetchInfo() {
            try {
                const { data, error } = await supabase
                    .from("infos")
                    .select("*")
                    .eq("id", id)
                    .single();
                
                if (error) throw error;
                setInfo(data);
            } catch (err) {
                console.error("Failed to fetch info:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchInfo();
    }, [id]);

    const handleUpdated = (updatedInfo: Info) => {
        setInfo(updatedInfo);
        setIsEditOpen(false);
    };

    const handleDeleted = () => {
        router.push("/info");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!info) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">情報が見つかりません</p>
                <Button onClick={() => router.back()} variant="gold" className="mt-4">
                    戻る
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        戻る
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditOpen(true)}
                    >
                        <Pencil className="h-4 w-4 mr-2" />
                        編集
                    </Button>
                </div>

                <div>
                    <h1 className="text-2xl font-bold font-serif text-primary mb-2">
                        {info.title}
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {new Date(info.created_at).toLocaleString("ja-JP")}
                    </p>
                </div>

                <Card>
                    <CardContent className="p-6">
                        {info.content_html ? (
                            <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: info.content_html }}
                            />
                        ) : (
                            <div className="whitespace-pre-wrap text-foreground">
                                {info.content_text}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Info">
                <InfoForm 
                    initialData={info} 
                    onUpdated={handleUpdated}
                    onDelete={handleDeleted}
                    onSuccess={() => setIsEditOpen(false)}
                />
            </Modal>
        </>
    );
}
