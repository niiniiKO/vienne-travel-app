"use client";

import * as React from "react";
import { QuickAddFAB } from "./quick-add-fab";
import { Modal } from "@/components/ui/modal";
import { TransactionForm } from "./transaction-form";
import { Profile, Transaction } from "@/types/database";
import { supabase } from "@/lib/supabase";

interface TransactionWithShares extends Transaction {
    forWhom?: string[];
}

export function TransactionManager() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [profiles, setProfiles] = React.useState<Profile[]>([]);

    React.useEffect(() => {
        async function fetchProfiles() {
            const { data } = await supabase.from("profiles").select("*");
            setProfiles(data || []);
        }
        fetchProfiles();
    }, []);

    React.useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('openTransactionModal', handleOpen);
        return () => window.removeEventListener('openTransactionModal', handleOpen);
    }, []);

    const handleCreate = async (transactionData: TransactionWithShares) => {
        try {
            console.log("Creating transaction with data:", transactionData);
            
            // Create transaction
            const insertData: Record<string, unknown> = {
                amount: transactionData.amount,
                currency: transactionData.currency,
                paid_by: transactionData.paid_by,
                participants: transactionData.forWhom || [], // Required NOT NULL column
            };
            
            // Only include description if it has a value
            if (transactionData.description) {
                insertData.description = transactionData.description;
            }
            
            const { data: newTransaction, error: transactionError } = await supabase
                .from("transactions")
                .insert(insertData)
                .select()
                .single();

            if (transactionError) {
                console.error("Transaction insert error:", transactionError.message, transactionError.code, transactionError.details);
                throw transactionError;
            }

            console.log("Transaction created:", newTransaction);

            // Create shares
            if (newTransaction && transactionData.forWhom && transactionData.forWhom.length > 0) {
                const shares = transactionData.forWhom.map(profileId => ({
                    transaction_id: newTransaction.id,
                    profile_id: profileId,
                }));

                console.log("Creating shares:", shares);

                const { error: sharesError } = await supabase
                    .from("transaction_shares")
                    .insert(shares);

                if (sharesError) {
                    console.error("Shares insert error:", sharesError.message, sharesError.code, sharesError.details);
                    throw sharesError;
                }
            }

            setIsOpen(false);
            // Dispatch event to refresh accounting page
            window.dispatchEvent(new CustomEvent('transactionCreated'));
        } catch (err: unknown) {
            const error = err as { message?: string; code?: string; details?: string };
            console.error("Failed to create transaction:", error?.message || err, error?.code || "", error?.details || "");
            alert(`支払いの登録に失敗しました: ${error?.message || "不明なエラー"}`);
        }
    };

    return (
        <>
            <QuickAddFAB onClick={() => setIsOpen(true)} />
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Register Payment"
            >
                <TransactionForm profiles={profiles} onSuccess={() => setIsOpen(false)} onUpdate={handleCreate} />
            </Modal>
        </>
    );
}
