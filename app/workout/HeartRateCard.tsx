import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Workout } from "../../lib/models/workout";

interface HeartRateCardProps {
    workout: Workout;
}

export default function HeartRateCard({ workout }: HeartRateCardProps) {
    if (!workout.heart_rate_avg && !workout.heart_rate_max) {
        return null;
    }

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Ionicons name="heart" size={20} color="#ff5526" />
                <Text style={styles.cardTitle}>Heart Rate</Text>
            </View>

            <View style={styles.statsRow}>
                {workout.heart_rate_avg && (
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>
                            {workout.heart_rate_avg}
                        </Text>
                        <Text style={styles.statLabel}>Avg BPM</Text>
                    </View>
                )}

                {workout.heart_rate_max && (
                    <View style={styles.stat}>
                        <Text style={styles.statValue}>
                            {workout.heart_rate_max}
                        </Text>
                        <Text style={styles.statLabel}>Max BPM</Text>
                    </View>
                )}
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
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
        marginLeft: 8,
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
});
