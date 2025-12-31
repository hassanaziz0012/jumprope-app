import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DayStreakData } from "../../lib/streaks";

interface StreakCalendarProps {
    data: DayStreakData[];
    year: number;
    month: number;
    onDayPress: (day: DayStreakData) => void;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
}

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StreakCalendar({
    data,
    year,
    month,
    onDayPress,
    onPreviousMonth,
    onNextMonth,
}: StreakCalendarProps) {
    const isCompleted = (day: DayStreakData) => day.hasWorkout || day.isRestDay;

    // Get the first day of the month to determine padding
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

    // Create empty cells for days before the first of the month
    const paddingDays = Array(startingDayOfWeek).fill(null);

    return (
        <View style={styles.container}>
            {/* Month/Year Navigation Header */}
            <View style={styles.header}>
                <Pressable
                    style={styles.navButton}
                    onPress={onPreviousMonth}
                    hitSlop={12}
                >
                    <Ionicons name="chevron-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.monthTitle}>
                    {MONTH_NAMES[month]} {year}
                </Text>
                <Pressable
                    style={styles.navButton}
                    onPress={onNextMonth}
                    hitSlop={12}
                >
                    <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="#ffffff"
                    />
                </Pressable>
            </View>

            {/* Weekday Labels */}
            <View style={styles.weekdayRow}>
                {WEEKDAY_LABELS.map((label) => (
                    <View key={label} style={styles.weekdayCell}>
                        <Text style={styles.weekdayLabel}>{label}</Text>
                    </View>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.grid}>
                {/* Padding days */}
                {paddingDays.map((_, index) => (
                    <View key={`pad-${index}`} style={styles.dayCell} />
                ))}

                {/* Actual days */}
                {data.map((day) => (
                    <Pressable
                        key={day.dateStr}
                        style={styles.dayCell}
                        onPress={() => onDayPress(day)}
                    >
                        <View
                            style={[
                                styles.dayCircle,
                                isCompleted(day) && styles.dayCircleCompleted,
                                day.isToday &&
                                    !isCompleted(day) &&
                                    styles.dayCircleToday,
                            ]}
                        >
                            {isCompleted(day) ? (
                                <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color="#ffffff"
                                />
                            ) : (
                                <Text
                                    style={[
                                        styles.dayNumber,
                                        day.isToday && styles.dayNumberToday,
                                        day.isFuture && styles.dayNumberFuture,
                                    ]}
                                >
                                    {day.date.getDate()}
                                </Text>
                            )}
                        </View>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    navButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
    },
    weekdayRow: {
        flexDirection: "row",
        marginBottom: 12,
    },
    weekdayCell: {
        flex: 1,
        alignItems: "center",
    },
    weekdayLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: "#666666",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    dayCell: {
        width: "14.28%", // 100% / 7 days
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
    },
    dayCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
    },
    dayCircleCompleted: {
        backgroundColor: "#ff5526",
    },
    dayCircleToday: {
        borderWidth: 2,
        borderColor: "#ff5526",
    },
    dayNumber: {
        fontSize: 14,
        fontWeight: "500",
        color: "#ffffff",
    },
    dayNumberToday: {
        color: "#ff5526",
        fontWeight: "700",
    },
    dayNumberFuture: {
        color: "#666666",
    },
});
