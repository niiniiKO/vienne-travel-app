"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ScheduleForm } from "./schedule-form";
import { Schedule } from "@/types/database";

let openScheduleModal: ((schedule?: Schedule) => void) | null = null;

export function ScheduleManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>();

    openScheduleModal = (schedule?: Schedule) => {
        setEditingSchedule(schedule);
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        setEditingSchedule(undefined);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={editingSchedule ? "Edit Schedule" : "Add Schedule"}
        >
            <ScheduleForm onSuccess={handleClose} initialData={editingSchedule} />
        </Modal>
    );
}

// Export function to open modal from anywhere
export function openScheduleForm(schedule?: Schedule) {
    openScheduleModal?.(schedule);
}
