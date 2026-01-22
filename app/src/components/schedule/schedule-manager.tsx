"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ScheduleForm } from "./schedule-form";
import { Schedule } from "@/types/database";

interface ScheduleManagerProps {
    onUpdate?: (schedule: Schedule) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
}

let openScheduleModal: ((schedule?: Schedule) => void) | null = null;

export function ScheduleManager({ onUpdate, onDelete }: ScheduleManagerProps) {
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

    const handleUpdate = (schedule: Schedule) => {
        onUpdate?.(schedule);
    };

    const handleDelete = () => {
        if (editingSchedule) {
            onDelete?.(editingSchedule.id);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={editingSchedule ? "Edit Schedule" : "Add Schedule"}
        >
            <ScheduleForm 
                onSuccess={handleClose} 
                initialData={editingSchedule}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />
        </Modal>
    );
}

// Export function to open modal from anywhere
export function openScheduleForm(schedule?: Schedule) {
    openScheduleModal?.(schedule);
}
