import { useState } from "react";
import { addRestDay, removeRestDay } from "../../lib/database";
import type { DayStreakData } from "../../lib/streaks";

interface UseRestDayResult {
    selectedDay: DayStreakData | null;
    isModalVisible: boolean;
    openModal: (day: DayStreakData) => void;
    closeModal: () => void;
    handleMarkRestDay: () => Promise<void>;
    handleRemoveRestDay: () => Promise<void>;
    formatDayLabel: (day: DayStreakData) => string;
}

export function useRestDay(onUpdate?: () => Promise<void>): UseRestDayResult {
    const [selectedDay, setSelectedDay] = useState<DayStreakData | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const openModal = (day: DayStreakData) => {
        setSelectedDay(day);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
    };

    const handleMarkRestDay = async () => {
        if (!selectedDay) return;
        await addRestDay(selectedDay.dateStr);
        setIsModalVisible(false);
        if (onUpdate) {
            await onUpdate();
        }
    };

    const handleRemoveRestDay = async () => {
        if (!selectedDay) return;
        await removeRestDay(selectedDay.dateStr);
        setIsModalVisible(false);
        if (onUpdate) {
            await onUpdate();
        }
    };

    const formatDayLabel = (day: DayStreakData): string => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            month: "short",
            day: "numeric",
        };
        return day.date.toLocaleDateString("en-US", options);
    };

    return {
        selectedDay,
        isModalVisible,
        openModal,
        closeModal,
        handleMarkRestDay,
        handleRemoveRestDay,
        formatDayLabel,
    };
}
