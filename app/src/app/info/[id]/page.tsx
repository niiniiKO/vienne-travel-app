"use client";

import { useParams, useRouter } from "next/navigation";
import { Info } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Mock Data (In real app, fetch from Supabase) - using fixed dates to prevent hydration mismatch
const MOCK_INFOS: Info[] = [
    {
        id: "info1",
        title: "ウィーンの公共交通機関",
        content_text: "U-Bahn, トラム、バスの使い方\n\n24時間券: €8\n72時間券: €17.10\n\nアプリ: WienMobil",
        created_at: "2026-02-01T00:00:00Z",
    },
    {
        id: "info2",
        title: "レストラン予約リスト",
        content_html: `
      <div style="font-family: serif; padding: 20px;">
        <h2 style="color: #800020; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">予約済みレストラン</h2>
        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #F5F5DC; border-bottom: 2px solid #D4AF37;">
              <th style="padding: 12px; text-align: left;">店名</th>
              <th style="padding: 12px; text-align: left;">日時</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #E6E6CA;">
              <td style="padding: 12px;"><strong>Figlmüller</strong></td>
              <td style="padding: 12px;">Feb 14, 13:00</td>
            </tr>
            <tr style="border-bottom: 1px solid #E6E6CA;">
              <td style="padding: 12px;"><strong>Plachutta</strong></td>
              <td style="padding: 12px;">Feb 15, 19:00</td>
            </tr>
            <tr>
              <td style="padding: 12px;"><strong>Café Sacher</strong></td>
              <td style="padding: 12px;">Feb 16, 15:00</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
        created_at: "2026-02-01T00:00:00Z",
    },
];

export default function InfoDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const info = MOCK_INFOS.find((i) => i.id === id);

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
        <div className="space-y-4">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mb-2"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
            </Button>

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
    );
}
