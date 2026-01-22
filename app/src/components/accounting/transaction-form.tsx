"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUser, MEMBERS } from "@/contexts/user-context";
import { Transaction } from "@/types/database";
import { Trash2 } from "lucide-react";

interface TransactionFormProps {
    className?: string;
    onSuccess?: () => void;
    onDelete?: () => void;
    initialData?: Transaction & { forWhom?: string[] };
}

export function TransactionForm({ className, onSuccess, onDelete, initialData }: TransactionFormProps) {
    const { currentUser } = useUser();
    const [amount, setAmount] = React.useState(initialData?.amount?.toString() || "");
    const [currency, setCurrency] = React.useState<"EUR" | "JPY">(initialData?.currency || "EUR");
    const [description, setDescription] = React.useState(initialData?.description || "");
    const [paidBy, setPaidBy] = React.useState(initialData?.paid_by || currentUser?.id || MEMBERS[0].id);
    const [forWhom, setForWhom] = React.useState<string[]>(initialData?.forWhom || MEMBERS.map(u => u.id));

    // Update paidBy when currentUser changes (only for new transactions)
    React.useEffect(() => {
        if (currentUser && !initialData) {
            setPaidBy(currentUser.id);
        }
    }, [currentUser, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Integrate with backend
        console.log({
            id: initialData?.id || `transaction-${Date.now()}`,
            amount: Number(amount),
            currency,
            description,
            paid_by: paidBy,
            forWhom,
            created_at: initialData?.created_at || new Date().toISOString(),
        });
        alert(initialData ? "Transaction updated (mock)!" : "Transaction registered (mock)!");
        if (!initialData) {
            setAmount("");
            setDescription("");
        }
        onSuccess?.();
    };

    const handleDelete = () => {
        if (confirm("このトランザクションを削除しますか?")) {
            // TODO: Backend integration
            console.log("Delete transaction:", initialData?.id);
            alert("Transaction deleted (mock)!");
            onDelete?.();
            onSuccess?.();
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
                    {MEMBERS.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">For Whom</label>
                <div className="flex flex-wrap gap-2">
                    {MEMBERS.map(user => {
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
                    {forWhom.length === MEMBERS.length ? "Everyone" : `${forWhom.length} people`}
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
