"use client";

import * as React from "react";
import { QuickAddFAB } from "./quick-add-fab";
import { Modal } from "@/components/ui/modal";
import { TransactionForm } from "./transaction-form";

export function TransactionManager() {
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('openTransactionModal', handleOpen);
        return () => window.removeEventListener('openTransactionModal', handleOpen);
    }, []);

    return (
        <>
            <QuickAddFAB onClick={() => setIsOpen(true)} />
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Register Payment"
            >
                <TransactionForm onSuccess={() => setIsOpen(false)} />
            </Modal>
        </>
    );
}
