"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/user-context";
import { Transaction, Profile } from "@/types/database";
import { Trash2 } from "lucide-react";

interface TransactionWithShares extends Transaction {
    forWhom?: string[];
}

interface TransactionFormProps {
    className?: string;
    profiles: Profile[];
    onSuccess?: () => void;
    onDelete?: () => void;
    onUpdate?: (transaction: TransactionWithShares) => void;
    initialData?: TransactionWithShares;
}

export function TransactionForm({ className, profiles = [], onSuccess, onDelete, onUpdate, initialData }: TransactionFormProps) {
    const { currentUser } = useUser();
    const [amount, setAmount] = React.useState(initialData?.amount?.toString() || "");
    const [currency, setCurrency] = React.useState<"EUR" | "JPY">(initialData?.currency || "EUR");
    const [description, setDescription] = React.useState(initialData?.description || "");
    const [paidBy, setPaidBy] = React.useState(initialData?.paid_by || currentUser?.id || (profiles[0]?.id ?? ""));
    const [forWhom, setForWhom] = React.useState<string[]>(initialData?.forWhom || (profiles.length > 0 ? profiles.map(u => u.id) : []));

    // Update paidBy when currentUser changes (only for new transactions)
    React.useEffect(() => {
        if (currentUser && !initialData) {
            setPaidBy(currentUser.id);
        }
    }, [currentUser, initialData]);

    // Update forWhom when profiles load
    React.useEffect(() => {
        if (!initialData && profiles.length > 0 && forWhom.length === 0) {
            setForWhom(profiles.map(u => u.id));
        }
    }, [profiles, initialData, forWhom.length]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const transactionData: TransactionWithShares = {
            id: initialData?.id || `transaction-${Date.now()}`,
            amount: Number(amount),
            currency,
            description,
            paid_by: paidBy,
            forWhom,
            created_at: initialData?.created_at || new Date().toISOString(),
        };

        onUpdate?.(transactionData);
    };

    const handleDelete = () => {
        if (confirm("このトランザクションを削除しますか?")) {
            onDelete?.();
        }
    };

    const toggleForWhom = (userId: string) => {
        setForWhom(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="font-mono text-lg"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Currency</label>
                    <div className="flex rounded-md shadow-sm">
                        <button
                            type="button"
                            onClick={() => setCurrency("EUR")}
                            className={cn(
                                "flex-1 px-4 py-2 text-sm font-medium border first:rounded-l-md last:rounded-r-md focus:z-10 focus:ring-2 focus:ring-primary",
                                currency === "EUR"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-foreground border-input hover:bg-accent"
                            )}
                        >
                            EUR
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrency("JPY")}
                            className={cn(
                                "flex-1 px-4 py-2 text-sm font-medium border-t border-b border-r last:rounded-r-md focus:z-10 focus:ring-2 focus:ring-primary",
                                currency === "JPY"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-foreground border-input hover:bg-accent"
                            )}
                        >
                            JPY
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                    placeholder="Dinner, Taxi, souvenir..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Paid By</label>
                <Select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                >
                    {profiles.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">For Whom</label>
                <div className="flex flex-wrap gap-2">
                    {profiles.map(user => {
                        const isSelected = forWhom.includes(user.id);
                        return (
                            <button
                                key={user.id}
                                type="button"
                                onClick={() => toggleForWhom(user.id)}
                                className={cn(
                                    "px-3 py-1.5 text-sm rounded-full border transition-all",
                                    isSelected
                                        ? "bg-secondary text-secondary-foreground border-secondary shadow-sm"
                                        : "bg-background text-muted-foreground border-input hover:border-secondary/50"
                                )}
                            >
                                {user.name}
                            </button>
                        )
                    })}
                </div>
                <div className="text-xs text-muted-foreground text-right">
                    {forWhom.length === profiles.length ? "Everyone" : `${forWhom.length} people`}
                </div>
            </div>

            <div className="flex gap-2">
                <Button type="submit" variant="gold" className="flex-1 mt-6" size="lg">
                    {initialData ? "Update Payment" : "Register Payment"}
                </Button>
                {initialData && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        onClick={handleDelete}
                        className="mt-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </form>
    );
}
