"use client";

import { useState } from "react";
import { Info } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { InfoForm } from "@/components/info/info-form";
import Link from "next/link";

// Mock Data - using fixed dates to prevent hydration mismatch
const MOCK_INFOS: Info[] = [
    {
        id: "info1",
        title: "ウィーンの公共交通機関",
        content_text: "U-Bahn, トラム、バスの使い方",
        created_at: "2026-02-01T00:00:00Z",
    },
    {
        id: "info2",
        title: "レストラン予約リスト",
        content_html: "<h2>予約済み</h2><ul><li>Figlmüller - Feb 14, 13:00</li><li>Plachutta - Feb 15, 19:00</li></ul>",
        created_at: "2026-02-01T00:00:00Z",
    },
];

export default function InfoPage() {
    const [infos] = useState(MOCK_INFOS);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const closeForm = () => {
        setIsFormOpen(false);
    };

    return (
        <>
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
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={isFormOpen} onClose={closeForm} title="Add Info">
                <InfoForm onSuccess={closeForm} />
            </Modal>
        </>
    );
}
