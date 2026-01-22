"use client";

import { BalanceBoard } from "@/components/accounting/balance-board";
import { TransactionList } from "@/components/accounting/transaction-list";
import { Transaction } from "@/types/database";
import { Modal } from "@/components/ui/modal";
import { TransactionForm } from "@/components/accounting/transaction-form";
import { useState } from "react";

const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: "t1",
        amount: 120,
        currency: "EUR",
        paid_by: "u1",
        description: "Dinner at Figlmüller",
        created_at: "2026-02-14T20:00:00Z",
    },
    {
        id: "t2",
        amount: 5000,
        currency: "JPY",
        paid_by: "u2",
        description: "Snacks at Airport",
        created_at: "2026-02-14T09:00:00Z",
    },
    {
        id: "t3",
        amount: 25,
        currency: "EUR",
        paid_by: "u3",
        description: "Uber to Hotel",
        created_at: "2026-02-14T11:00:00Z",
    },
];

export default function AccountingPage() {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);

    const openEditModal = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingTransaction(undefined);
    };

    return (
        <>
            <div className="space-y-8">
                <h2 className="text-xl font-bold font-serif text-primary">Accounting</h2>

                <BalanceBoard transactions={MOCK_TRANSACTIONS} />
                <TransactionList transactions={MOCK_TRANSACTIONS} onEdit={openEditModal} />
            </div>

            <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Transaction">
                <TransactionForm onSuccess={closeEditModal} initialData={editingTransaction} />
            </Modal>
        </>
    );
}
