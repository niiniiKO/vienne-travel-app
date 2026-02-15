"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction, Profile } from "@/types/database";
import { cn } from "@/lib/utils";
import { EXCHANGE_RATES } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// 前回の旅行からの繰越残高 (JPY)
// プラス = 払いすぎ（返してもらう側）、マイナス = 不足（払う側）
export const INITIAL_BALANCE_JPY: Record<string, number> = {
    "青山": 55704,
    "浅田": -118491,
    "市川": -48274,
    "鬼澤": 133060,
};

interface BalanceBoardProps {
    transactions: Transaction[];
    profiles: Profile[];
}

export function BalanceBoard({ transactions, profiles }: BalanceBoardProps) {
    const [showDetails, setShowDetails] = React.useState(false);

    // If no profiles, show empty state
    if (profiles.length === 0) {
        return (
            <Card className="bg-card shadow-sm">
                <CardContent className="py-8 text-center text-muted-foreground">
                    プロフィールを読み込み中...
                </CardContent>
            </Card>
        );
    }

    // --- Calculation Logic ---

    // 1. Totals per currency
    const totalEUR = transactions
        .filter((t) => t.currency === "EUR")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalJPY = transactions
        .filter((t) => t.currency === "JPY")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalCZK = transactions
        .filter((t) => t.currency === "CZK")
        .reduce((sum, t) => sum + Number(t.amount), 0);

    // Approximate Total in EUR
    const totalApproxEUR = totalEUR + (totalJPY / EXCHANGE_RATES.EUR_JPY) + (totalCZK / EXCHANGE_RATES.EUR_CZK);
    const perPersonApproxEUR = totalApproxEUR / profiles.length;

    const perPersonEUR = totalEUR / profiles.length;
    const perPersonJPY = totalJPY / profiles.length;
    const perPersonCZK = totalCZK / profiles.length;

    // 2. Balances per User
    const balances = profiles.map((user) => {
        const paidEUR = transactions
            .filter((t) => t.paid_by === user.id && t.currency === "EUR")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const paidJPY = transactions
            .filter((t) => t.paid_by === user.id && t.currency === "JPY")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const paidCZK = transactions
            .filter((t) => t.paid_by === user.id && t.currency === "CZK")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const diffEUR = paidEUR - perPersonEUR;
        const diffJPY = paidJPY - perPersonJPY;
        const diffCZK = paidCZK - perPersonCZK;

        // 前回旅行からの繰越残高を追加
        const initialBalanceJPY = INITIAL_BALANCE_JPY[user.name] || 0;

        // Approximate Difference in EUR (繰越残高を含む)
        const diffApproxEUR = diffEUR + ((diffJPY + initialBalanceJPY) / EXCHANGE_RATES.EUR_JPY) + (diffCZK / EXCHANGE_RATES.EUR_CZK);

        return {
            name: user.name,
            diffEUR,
            diffJPY,
            diffCZK,
            initialBalanceJPY,
            diffApproxEUR,
        };
    });

    return (
        <div className="space-y-4">
            {/* Unified Approximate View */}
            <Card className="bg-card shadow-sm border-gold/50">
                <CardHeader className="pb-2 border-b border-border/50 bg-secondary/10">
                    <CardTitle className="text-xl font-serif text-center text-primary">
                        Approximate Balance (EUR)
                    </CardTitle>
                    <p className="text-xs text-center text-muted-foreground">
                        Rate: 1 EUR = {EXCHANGE_RATES.EUR_JPY} JPY / {EXCHANGE_RATES.EUR_CZK} CZK
                    </p>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="space-y-3">
                        {balances.map((b) => (
                            <div key={b.name} className="flex justify-between items-center text-base border-b border-dashed border-muted last:border-0 pb-2 last:pb-0">
                                <span className="font-bold">{b.name}</span>
                                <span className={cn(
                                    "font-mono text-lg font-medium",
                                    b.diffApproxEUR > 0 ? "text-green-700" : b.diffApproxEUR < 0 ? "text-red-700" : "text-muted-foreground"
                                )}>
                                    {b.diffApproxEUR > 0 ? "+" : ""}{b.diffApproxEUR.toFixed(2)} €
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Verification / Toggle for Details */}
            <div className="text-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-muted-foreground hover:text-foreground hover:bg-transparent"
                >
                    {showDetails ? (
                        <>
                            <ChevronUp className="h-4 w-4 mr-1" /> Hide Details
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4 mr-1" /> Show Details (EUR / CZK / JPY)
                        </>
                    )}
                </Button>
            </div>

            {/* Detailed Currency Wrappers (Collapsible) */}
            {showDetails && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Card className="bg-card/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-muted-foreground">Balance (EUR Only)</CardTitle>
                            <p className="text-xs text-muted-foreground">Total: €{totalEUR.toFixed(2)}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {balances.map((b) => (
                                    <div key={b.name} className="flex justify-between items-center text-sm border-b pb-1 last:border-0 last:pb-0">
                                        <span className="font-medium">{b.name}</span>
                                        <span className={cn(
                                            "font-mono",
                                            b.diffEUR > 0 ? "text-green-600" : b.diffEUR < 0 ? "text-red-600" : "text-muted-foreground"
                                        )}>
                                            {b.diffEUR > 0 ? "+" : ""}{b.diffEUR.toFixed(0)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-muted-foreground">Balance (CZK Only)</CardTitle>
                            <p className="text-xs text-muted-foreground">Total: {totalCZK.toLocaleString()} Kč</p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {balances.map((b) => (
                                    <div key={b.name} className="flex justify-between items-center text-sm border-b pb-1 last:border-0 last:pb-0">
                                        <span className="font-medium">{b.name}</span>
                                        <span className={cn(
                                            "font-mono",
                                            b.diffCZK > 0 ? "text-green-600" : b.diffCZK < 0 ? "text-red-600" : "text-muted-foreground"
                                        )}>
                                            {b.diffCZK > 0 ? "+" : ""}{b.diffCZK.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-muted-foreground">Balance (JPY Only)</CardTitle>
                            <p className="text-xs text-muted-foreground">Total: ¥{totalJPY.toLocaleString()}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {balances.map((b) => (
                                    <div key={b.name} className="flex justify-between items-center text-sm border-b pb-1 last:border-0 last:pb-0">
                                        <span className="font-medium">{b.name}</span>
                                        <span className={cn(
                                            "font-mono",
                                            b.diffJPY > 0 ? "text-green-600" : b.diffJPY < 0 ? "text-red-600" : "text-muted-foreground"
                                        )}>
                                            {b.diffJPY > 0 ? "+" : ""}{b.diffJPY.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
