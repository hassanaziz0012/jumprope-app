import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DayStreakData } from "../../lib/streaks";

interface WeeklyStreakProps {
    data: DayStreakData[];
    onDayPress: (day: DayStreakData) => void;
}

export default function WeeklyStreak({ data, onDayPress }: WeeklyStreakProps) {
    const isCompleted = (day: DayStreakData) => day.hasWorkout || day.isRestDay;

    return (
        <View style={styles.container}>
            {data.map((day) => (
                <Pressable
                    key={day.dateStr}
                    style={styles.dayContainer}
                    onPress={() => onDayPress(day)}
                >
                    <View
                        style={[
                            styles.circle,
                            isCompleted(day) && styles.circleCompleted,
                            day.isToday &&
                                !isCompleted(day) &&
                                styles.circleToday,
                        ]}
                    >
                        {isCompleted(day) && (
                            <Ionicons
                                name="checkmark"
                                size={18}
                                color="#ffffff"
                            />
                        )}
                    </View>
                    <Text
                        style={[
                            styles.dayLabel,
                            day.isToday && styles.dayLabelToday,
                        ]}
                    >
                        {day.dayLabel}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 4,
    },
    dayContainer: {
        alignItems: "center",
        gap: 8,
    },
    circle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#2a2a2a",
        justifyContent: "center",
        alignItems: "center",
    },
    circleCompleted: {
        backgroundColor: "#ff5526",
    },
    circleToday: {
        borderWidth: 2,
        borderColor: "#ff5526",
    },
    dayLabel: {
        fontSize: 12,
        color: "#a0a0a0",
        fontWeight: "500",
    },
    dayLabelToday: {
        color: "#ffffff",
        fontWeight: "600",
    },
});
