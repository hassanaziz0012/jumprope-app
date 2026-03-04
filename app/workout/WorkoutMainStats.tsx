import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { formatDuration } from "../../lib/dates";
import { Workout } from "../../lib/models/workout";

interface WorkoutMainStatsProps {
    workout: Workout;
}

export default function WorkoutMainStats({ workout }: WorkoutMainStatsProps) {
    return (
        <View style={styles.statsCard}>
            <View style={styles.mainStat}>
                <Text style={styles.mainStatValue}>
                    {workout.total_skips.toLocaleString()}
                </Text>
                <Text style={styles.mainStatLabel}>Total Skips</Text>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <View style={styles.statValueRow}>
                        <Ionicons
                            name="time-outline"
                            size={20}
                            color="#ffffff"
                        />
                        <Text style={styles.statValue}>
                            {formatDuration(workout.duration)}
                        </Text>
                    </View>
                    <Text style={styles.statLabel}>Duration</Text>
                </View>

                <View style={styles.stat}>
                    <View style={styles.statValueRow}>
                        <Ionicons
                            name="speedometer-outline"
                            size={20}
                            color="#ffffff"
                        />
                        <Text style={styles.statValue}>
                            {Math.round(workout.avg_skips_per_minute)}
                        </Text>
                    </View>
                    <Text style={styles.statLabel}>Avg Skips/Min</Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <View style={styles.statValueRow}>
                        <Ionicons
                            name="alert-circle-outline"
                            size={20}
                            color="#ffffff"
                        />
                        <Text style={styles.statValue}>
                            {workout.trips}
                        </Text>
                    </View>
                    <Text style={styles.statLabel}>Trips</Text>
                </View>

                {workout.calories && (
                    <View style={styles.stat}>
                        <View style={styles.statValueRow}>
                            <Ionicons
                                name="flame-outline"
                                size={20}
                                color="#ffffff"
                            />
                            <Text style={styles.statValue}>
                                {Math.round(workout.calories)}
                            </Text>
                        </View>
                        <Text style={styles.statLabel}>Calories</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    statsCard: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    mainStat: {
        alignItems: "center",
        marginBottom: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#2a2a2a",
    },
    mainStatValue: {
        fontSize: 48,
        fontWeight: "700",
        color: "#ffffff",
    },
    mainStatLabel: {
        fontSize: 14,
        color: "#a0a0a0",
        marginTop: 4,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 16,
    },
    stat: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "700",
        color: "#ffffff",
    },
    statLabel: {
        fontSize: 12,
        color: "#666666",
        marginTop: 4,
    },
    statValueRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
});
