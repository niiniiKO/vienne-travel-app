"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction, Profile } from "@/types/database";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock Profiles for now
const PROFILES: Profile[] = [
    { id: "u1", name: "Aoyama" },
    { id: "u2", name: "Asada" },
    { id: "u3", name: "Ichikawa" },
    { id: "u4", name: "Onizawa" },
];

const EXCHANGE_RATE = 180; // 1 EUR = 180 JPY

interface BalanceBoardProps {
    transactions: Transaction[];
}

export function BalanceBoard({ transactions }: BalanceBoardProps) {
    const [showDetails, setShowDetails] = React.useState(false);

    // --- Calculation Logic ---

    // 1. Totals
    const totalEUR = transactions
        .filter((t) => t.currency === "EUR")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalJPY = transactions
        .filter((t) => t.currency === "JPY")
        .reduce((sum, t) => sum + t.amount, 0);

    // Approximate Total in EUR
    const totalApproxEUR = totalEUR + (totalJPY / EXCHANGE_RATE);
    const perPersonApproxEUR = totalApproxEUR / 4;

    const perPersonEUR = totalEUR / 4;
    const perPersonJPY = totalJPY / 4;

    // 2. Balances per User
    const balances = PROFILES.map((user) => {
        const paidEUR = transactions
            .filter((t) => t.paid_by === user.id && t.currency === "EUR")
            .reduce((sum, t) => sum + t.amount, 0);

        const paidJPY = transactions
            .filter((t) => t.paid_by === user.id && t.currency === "JPY")
            .reduce((sum, t) => sum + t.amount, 0);

        const diffEUR = paidEUR - perPersonEUR;
        const diffJPY = paidJPY - perPersonJPY;

        // Approximate Difference in EUR
        const diffApproxEUR = diffEUR + (diffJPY / EXCHANGE_RATE);

        return {
            name: user.name,
            diffEUR,
            diffJPY,
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
                        Rate: 1 EUR = {EXCHANGE_RATE} JPY
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
                            <ChevronDown className="h-4 w-4 mr-1" /> Show Details (EUR / JPY)
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
