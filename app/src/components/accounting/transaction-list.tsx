"use client";

import { Transaction, Profile } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";

// Mock Profiles Map
const PROFILE_MAP: Record<string, string> = {
    "u1": "Aoyama",
    "u2": "Asada",
    "u3": "Ichikawa",
    "u4": "Onizawa",
};

interface TransactionListProps {
    transactions: Transaction[];
    onEdit?: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, onEdit }: TransactionListProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif px-1">Recent Transactions</h3>
            {transactions.map((t) => (
                <Card 
                    key={t.id} 
                    className="hover:bg-accent/5 transition-colors cursor-pointer hover:shadow-md"
                    onClick={() => onEdit?.(t)}
                >
                    <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="font-bold text-base">{t.description}</span>
                            <span className="text-xs text-muted-foreground">
                                Paid by {PROFILE_MAP[t.paid_by] ?? "Unknown"} • {new Date(t.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="font-mono text-lg font-medium text-primary">
                                {t.currency === "EUR" ? "€" : "¥"}{t.amount.toLocaleString()}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
