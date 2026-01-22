"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { ScheduleForm } from "./schedule-form";
import { Schedule } from "@/types/database";

interface ScheduleManagerProps {
    onUpdate?: (schedule: Schedule) => void | Promise<void>;
    onDelete?: (id: string) => void | Promise<void>;
}

let openScheduleModal: ((schedule?: Schedule, defaultDate?: string) => void) | null = null;

export function ScheduleManager({ onUpdate, onDelete }: ScheduleManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | undefined>();
    const [defaultDate, setDefaultDate] = useState<string | undefined>();

    openScheduleModal = (schedule?: Schedule, date?: string) => {
        setEditingSchedule(schedule);
        setDefaultDate(date);
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        setEditingSchedule(undefined);
        setDefaultDate(undefined);
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
                defaultDate={defaultDate}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />
        </Modal>
    );
}

// Export function to open modal from anywhere
export function openScheduleForm(schedule?: Schedule, defaultDate?: string) {
    openScheduleModal?.(schedule, defaultDate);
}
