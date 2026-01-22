"use client";

import { BalanceBoard, INITIAL_BALANCE_JPY } from "@/components/accounting/balance-board";
import { TransactionList } from "@/components/accounting/transaction-list";
import { Transaction, TransactionShare, Profile } from "@/types/database";
import { Modal } from "@/components/ui/modal";
import { TransactionForm } from "@/components/accounting/transaction-form";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";

// Extended transaction type with shares
export interface TransactionWithShares extends Transaction {
    shares?: TransactionShare[];
    forWhom?: string[];
    isCarryOver?: boolean; // 繰越残高フラグ
}

export default function AccountingPage() {
    const [transactions, setTransactions] = useState<TransactionWithShares[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<TransactionWithShares | undefined>(undefined);

    // Fetch profiles
    const fetchProfiles = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("name");
            
            if (error) {
                console.error("Profiles fetch error:", error.message, error.code);
                if (error.code === "42P01") {
                    console.warn("profiles table does not exist");
                    return;
                }
                throw error;
            }
            setProfiles(data || []);
        } catch (err: unknown) {
            const error = err as { message?: string; code?: string };
            console.error("Failed to fetch profiles:", error?.message || err, error?.code || "");
        }
    }, []);

    // Fetch transactions with shares
    const fetchTransactions = useCallback(async () => {
        try {
            const { data: transactionsData, error: transactionsError } = await supabase
                .from("transactions")
                .select("*")
                .order("created_at", { ascending: false });
            
            if (transactionsError) {
                console.error("Transactions fetch error:", transactionsError.message, transactionsError.code);
                if (transactionsError.code === "42P01") {
                    console.warn("transactions table does not exist");
                    setTransactions([]);
                    return;
                }
                throw transactionsError;
            }

            // Fetch all shares
            const { data: sharesData, error: sharesError } = await supabase
                .from("transaction_shares")
                .select("*");
            
            if (sharesError) {
                console.error("Shares fetch error:", sharesError.message, sharesError.code);
                if (sharesError.code === "42P01") {
                    console.warn("transaction_shares table does not exist");
                }
                // Continue without shares if table doesn't exist
            }

            // Combine transactions with their shares
            const transactionsWithShares = (transactionsData || []).map(t => {
                const shares = (sharesData || []).filter(s => s.transaction_id === t.id);
                return {
                    ...t,
                    shares,
                    forWhom: shares.map(s => s.profile_id)
                };
            });

            setTransactions(transactionsWithShares);
        } catch (err: unknown) {
            const error = err as { message?: string; code?: string };
            console.error("Failed to fetch transactions:", error?.message || err, error?.code || "");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfiles();
        fetchTransactions();
    }, [fetchProfiles, fetchTransactions]);

    // Listen for transaction created event from TransactionManager
    useEffect(() => {
        const handleTransactionCreated = () => {
            fetchTransactions();
        };
        window.addEventListener('transactionCreated', handleTransactionCreated);
        return () => window.removeEventListener('transactionCreated', handleTransactionCreated);
    }, [fetchTransactions]);

    const handleRefresh = async () => {
        await fetchTransactions();
    };

    // 宮古島会計の繰越残高トランザクションを生成
    const carryOverTransactions: TransactionWithShares[] = useMemo(() => {
        return profiles
            .filter(profile => INITIAL_BALANCE_JPY[profile.name] !== undefined && INITIAL_BALANCE_JPY[profile.name] !== 0)
            .map(profile => ({
                id: `carryover-${profile.id}`,
                amount: Math.abs(INITIAL_BALANCE_JPY[profile.name]),
                currency: "JPY" as const,
                paid_by: INITIAL_BALANCE_JPY[profile.name] > 0 ? profile.id : "", // プラスの人が支払った側
                description: `宮古島会計 (${INITIAL_BALANCE_JPY[profile.name] > 0 ? "+" : ""}${INITIAL_BALANCE_JPY[profile.name].toLocaleString()}円)`,
                created_at: "2025-12-01T00:00:00Z", // 過去の日付
                isCarryOver: true,
                forWhom: INITIAL_BALANCE_JPY[profile.name] < 0 ? [profile.id] : [], // マイナスの人が負担側
            }));
    }, [profiles]);

    // 表示用のトランザクション（実際のトランザクション + 繰越）
    const displayTransactions = useMemo(() => {
        return [...transactions, ...carryOverTransactions];
    }, [transactions, carryOverTransactions]);

    const openEditModal = (transaction: TransactionWithShares) => {
        // 繰越トランザクションは編集不可
        if (transaction.isCarryOver) return;
        setEditingTransaction(transaction);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingTransaction(undefined);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    // Handle transaction update
    const handleTransactionUpdate = async (transaction: TransactionWithShares) => {
        try {
            const isNew = !transaction.id || transaction.id.startsWith("transaction-");
            
            if (isNew) {
                // Create new transaction
                const { data, error } = await supabase
                    .from("transactions")
                    .insert({
                        amount: transaction.amount,
                        currency: transaction.currency,
                        paid_by: transaction.paid_by,
                        description: transaction.description,
                    })
                    .select()
                    .single();
                
                if (error) throw error;

                // Create shares
                if (transaction.forWhom && transaction.forWhom.length > 0) {
                    const shares = transaction.forWhom.map(profileId => ({
                        transaction_id: data.id,
                        profile_id: profileId,
                    }));
                    
                    const { error: sharesError } = await supabase
                        .from("transaction_shares")
                        .insert(shares);
                    
                    if (sharesError) throw sharesError;
                }

                await fetchTransactions();
                closeAddModal();
            } else {
                // Update existing transaction
                const { error } = await supabase
                    .from("transactions")
                    .update({
                        amount: transaction.amount,
                        currency: transaction.currency,
                        paid_by: transaction.paid_by,
                        description: transaction.description,
                    })
                    .eq("id", transaction.id);
                
                if (error) throw error;

                // Delete old shares and create new ones
                await supabase
                    .from("transaction_shares")
                    .delete()
                    .eq("transaction_id", transaction.id);

                if (transaction.forWhom && transaction.forWhom.length > 0) {
                    const shares = transaction.forWhom.map(profileId => ({
                        transaction_id: transaction.id,
                        profile_id: profileId,
                    }));
                    
                    const { error: sharesError } = await supabase
                        .from("transaction_shares")
                        .insert(shares);
                    
                    if (sharesError) throw sharesError;
                }

                await fetchTransactions();
                closeEditModal();
            }
        } catch (err) {
            console.error("Failed to save transaction:", err);
            alert("トランザクションの保存に失敗しました");
        }
    };

    // Handle transaction delete
    const handleTransactionDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("transactions")
                .delete()
                .eq("id", id);
            
            if (error) throw error;
            await fetchTransactions();
            closeEditModal();
        } catch (err) {
            console.error("Failed to delete transaction:", err);
            alert("トランザクションの削除に失敗しました");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <PullToRefresh onRefresh={handleRefresh}>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold font-serif text-primary">Accounting</h2>
                        <Button
                            variant="gold"
                            size="sm"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Payment
                        </Button>
                    </div>

                    <BalanceBoard transactions={transactions} profiles={profiles} />
                    <TransactionList 
                        transactions={displayTransactions} 
                        profiles={profiles}
                        onEdit={openEditModal} 
                    />
                </div>
            </PullToRefresh>

            <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title="Register Payment">
                <TransactionForm 
                    profiles={profiles}
                    onSuccess={closeAddModal} 
                    onUpdate={handleTransactionUpdate}
                />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Transaction">
                <TransactionForm 
                    profiles={profiles}
                    onSuccess={closeEditModal} 
                    initialData={editingTransaction}
                    onUpdate={handleTransactionUpdate}
                    onDelete={() => editingTransaction && handleTransactionDelete(editingTransaction.id)}
                />
            </Modal>
        </>
    );
}
