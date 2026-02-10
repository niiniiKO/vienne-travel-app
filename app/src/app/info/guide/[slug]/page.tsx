"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const guides: Record<string, { title: string; file: string }> = {
    vienna: {
        title: "ウィーン観光ガイド",
        file: "/vienna-guide.html",
    },
    prague: {
        title: "プラハ観光ガイド",
        file: "/prague-guide.html",
    },
};

export default function GuidePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const guide = guides[slug];

    if (!guide) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">ガイドが見つかりません</p>
                <button
                    onClick={() => router.back()}
                    className="mt-4 text-primary underline"
                >
                    戻る
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
            {/* ヘッダー：戻るボタン */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card shadow-sm flex-shrink-0">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-primary font-semibold text-sm py-1.5 px-2 rounded-lg hover:bg-secondary/10 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Info に戻る</span>
                </button>
                <span className="text-sm text-muted-foreground truncate ml-auto">
                    {guide.title}
                </span>
            </div>

            {/* iframe でHTMLを表示 */}
            <iframe
                src={guide.file}
                className="flex-1 w-full border-none"
                title={guide.title}
            />
        </div>
    );
}
