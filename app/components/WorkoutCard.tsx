import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Workout } from "../../lib/database";
import { formatDuration } from "../../lib/dates";

interface WorkoutCardProps {
    workout: Workout;
    onPress?: () => void;
}

export default function WorkoutCard({ workout, onPress }: WorkoutCardProps) {
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.card,
                pressed && onPress && styles.pressed,
            ]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.header}>
                <Text style={styles.date}>{formatDate(workout.date)}</Text>
                {workout.trips === 0 && (
                    <View style={styles.perfectBadge}>
                        <Ionicons name="star" size={12} color="#ccfa53" />
                        <Text style={styles.perfectText}>Perfect</Text>
                    </View>
                )}
            </View>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>
                        {workout.total_skips.toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>skips</Text>
                </View>

                <View style={styles.stat}>
                    <Text style={styles.statValue}>
                        {formatDuration(workout.duration)}
                    </Text>
                    <Text style={styles.statLabel}>duration</Text>
                </View>

                <View style={styles.stat}>
                    <Text style={styles.statValue}>{workout.trips}</Text>
                    <Text style={styles.statLabel}>trips</Text>
                </View>

                {workout.calories && (
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>
                            {Math.round(workout.calories)}
                        </Text>
                        <Text style={styles.statLabel}>cal</Text>
                    </View>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.99 }],
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    date: {
        fontSize: 14,
        fontWeight: "600",
        color: "#a0a0a0",
    },
    perfectBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(204, 250, 83, 0.15)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    perfectText: {
        fontSize: 11,
        fontWeight: "500",
        color: "#ccfa53",
        marginLeft: 4,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    stat: {
        alignItems: "center",
    },
    statValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: "#666666",
    },
});
