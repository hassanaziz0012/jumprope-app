import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { DayStreakData } from "../../lib/streaks";
import WeeklyStreak from "./WeeklyStreak";

interface StreakCardProps {
    currentStreak: number;
    weeklyData: DayStreakData[];
    onDayPress: (day: DayStreakData) => void;
}

export default function StreakCard({
    currentStreak,
    weeklyData,
    onDayPress,
}: StreakCardProps) {
    return (
        <View style={styles.card}>
            {/* Current Streak Display */}
            <View style={styles.currentStreak}>
                <View style={styles.flameContainer}>
                    <Ionicons name="flame" size={48} color="#ff5526" />
                </View>
                <Text style={styles.streakNumber}>{currentStreak} days</Text>
                <Text style={styles.streakLabel}>Workout streak</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Weekly Streak */}
            <View style={styles.weeklySection}>
                <Text style={styles.weeklyTitle}>This Week</Text>
                <WeeklyStreak data={weeklyData} onDayPress={onDayPress} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    currentStreak: {
        alignItems: "center",
        paddingVertical: 8,
    },
    flameContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "rgba(255, 85, 38, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    streakNumber: {
        fontSize: 32,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 4,
    },
    streakLabel: {
        fontSize: 14,
        color: "#a0a0a0",
    },
    divider: {
        height: 1,
        backgroundColor: "#2a2a2a",
        marginVertical: 20,
    },
    weeklySection: {
        gap: 16,
    },
    weeklyTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
});
