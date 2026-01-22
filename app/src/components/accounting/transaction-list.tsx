"use client";

import { Transaction, Profile } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";

interface TransactionWithCarryOver extends Transaction {
    isCarryOver?: boolean;
}

interface TransactionListProps {
    transactions: TransactionWithCarryOver[];
    profiles: Profile[];
    onEdit?: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, profiles, onEdit }: TransactionListProps) {
    const getProfileName = (id: string) => {
        const profile = profiles.find(p => p.id === id);
        return profile?.name ?? "Unknown";
    };

    // 通常のトランザクションと繰越を分離
    const regularTransactions = transactions.filter(t => !t.isCarryOver);
    const carryOverTransactions = transactions.filter(t => t.isCarryOver);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif px-1">Recent Transactions</h3>
            {regularTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <p>トランザクションがまだありません</p>
                </div>
            ) : (
                regularTransactions.map((t) => (
                    <Card 
                        key={t.id} 
                        className="hover:bg-accent/5 transition-colors cursor-pointer hover:shadow-md"
                        onClick={() => onEdit?.(t)}
                    >
                        <CardContent className="p-3 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-bold text-base">{t.description || "No description"}</span>
                                <span className="text-xs text-muted-foreground">
                                    Paid by {getProfileName(t.paid_by)} • {new Date(t.created_at).toLocaleDateString("ja-JP")}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="font-mono text-lg font-medium text-primary">
                                    {t.currency === "EUR" ? "€" : "¥"}{Number(t.amount).toLocaleString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}

            {/* 繰越残高セクション */}
            {carryOverTransactions.length > 0 && (
                <>
                    <h3 className="text-lg font-bold font-serif px-1 mt-6 flex items-center gap-2">
                        <History className="h-5 w-5" />
                        宮古島会計 (繰越)
                    </h3>
                    <div className="space-y-2">
                        {carryOverTransactions.map((t) => (
                            <Card 
                                key={t.id} 
                                className={cn(
                                    "bg-secondary/10 border-dashed",
                                    "cursor-default"
                                )}
                            >
                                <CardContent className="p-3 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm text-muted-foreground">
                                            {t.description || "繰越"}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn(
                                            "font-mono text-base font-medium",
                                            t.paid_by ? "text-green-700" : "text-red-700"
                                        )}>
                                            {t.paid_by ? "+" : "-"}¥{Number(t.amount).toLocaleString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
