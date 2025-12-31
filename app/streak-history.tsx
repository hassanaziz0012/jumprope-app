import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    getCurrentStreak,
    getMonthlyStreakData,
    type DayStreakData,
} from "../lib/streaks";
import RestDayModal from "./components/RestDayModal";
import StreakCalendar from "./components/StreakCalendar";
import { useRestDay } from "./hooks/useRestDay";

export default function StreakHistoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Current streak
    const [currentStreak, setCurrentStreak] = useState(0);

    // Calendar state
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [monthlyData, setMonthlyData] = useState<DayStreakData[]>([]);

    // Load data function (used by rest day hook and focus effect)
    const loadData = useCallback(async () => {
        const [streakData, monthData] = await Promise.all([
            getCurrentStreak(),
            getMonthlyStreakData(currentYear, currentMonth),
        ]);
        setCurrentStreak(streakData);
        setMonthlyData(monthData);
    }, [currentYear, currentMonth]);

    const {
        selectedDay,
        isModalVisible,
        openModal,
        closeModal,
        handleMarkRestDay,
        handleRemoveRestDay,
        formatDayLabel,
    } = useRestDay(loadData);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const handlePreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentYear((prev) => prev - 1);
            setCurrentMonth(11);
        } else {
            setCurrentMonth((prev) => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentYear((prev) => prev + 1);
            setCurrentMonth(0);
        } else {
            setCurrentMonth((prev) => prev + 1);
        }
    };

    const handleDayPress = (day: DayStreakData) => {
        openModal(day);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.back()}
                    hitSlop={12}
                >
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.headerTitle}>Streak</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Current Streak Card */}
                <View style={styles.streakCard}>
                    <View style={styles.streakInfo}>
                        <Text style={styles.streakNumber}>{currentStreak}</Text>
                        <Text style={styles.streakLabel}>Streak Days</Text>
                        {currentStreak > 0 && (
                            <Text style={styles.streakMessage}>
                                Keep up the great work!
                            </Text>
                        )}
                    </View>
                    <View style={styles.flameContainer}>
                        <Ionicons name="flame" size={64} color="#ff5526" />
                    </View>
                </View>

                {/* Streak Calendar Section */}
                <Text style={styles.sectionTitle}>Streak Calendar</Text>
                <StreakCalendar
                    data={monthlyData}
                    year={currentYear}
                    month={currentMonth}
                    onDayPress={handleDayPress}
                    onPreviousMonth={handlePreviousMonth}
                    onNextMonth={handleNextMonth}
                />
            </ScrollView>

            {/* Rest Day Modal */}
            {selectedDay && (
                <RestDayModal
                    visible={isModalVisible}
                    date={selectedDay.dateStr}
                    dayLabel={formatDayLabel(selectedDay)}
                    isRestDay={selectedDay.isRestDay}
                    hasWorkout={selectedDay.hasWorkout}
                    onMarkRestDay={handleMarkRestDay}
                    onRemoveRestDay={handleRemoveRestDay}
                    onClose={closeModal}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
    },
    placeholder: {
        width: 44,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    streakCard: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    streakInfo: {
        flex: 1,
    },
    streakNumber: {
        fontSize: 52,
        fontWeight: "700",
        color: "#4ECDC4",
        lineHeight: 56,
    },
    streakLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ff5526",
        marginTop: 4,
    },
    streakMessage: {
        fontSize: 14,
        color: "#a0a0a0",
        marginTop: 8,
    },
    flameContainer: {
        width: 80,
        height: 80,
        justifyContent: "center",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 16,
    },
});
