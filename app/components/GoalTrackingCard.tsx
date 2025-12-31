import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { GoalProgressItem } from "../../lib/goalTracking";
import CircularProgress from "./CircularProgress";

interface GoalTrackingCardProps {
    goals: GoalProgressItem[];
}

export default function GoalTrackingCard({ goals }: GoalTrackingCardProps) {
    if (!goals || goals.length === 0) {
        return null; // Don't show anything if no goals are set
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Goals</Text>
            <View style={styles.grid}>
                {goals.map((goal, index) => (
                    <View key={goal.key} style={styles.cardContainer}>
                        <View style={styles.card}>
                            <CircularProgress
                                size={120}
                                strokeWidth={8}
                                progress={goal.progress}
                                color="#ccfa53" // Primary Lime
                                unfilledColor="#2a2a2a"
                            >
                                <View style={styles.circleContent}>
                                    <View style={styles.valueRow}>
                                        <Text style={styles.currentValue}>
                                            {goal.current}
                                        </Text>
                                        <Text style={styles.divider}>/</Text>
                                        <Text style={styles.targetValue}>
                                            {goal.target}
                                        </Text>
                                    </View>
                                    <Text style={styles.unit}>{goal.unit}</Text>
                                </View>
                            </CircularProgress>
                            <Text style={styles.label} numberOfLines={1}>
                                {goal.label}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 16,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -8, // Negative margin to offset card padding
    },
    cardContainer: {
        width: "50%",
        padding: 6,
    },
    card: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    circleContent: {
        justifyContent: "center",
        alignItems: "center",
    },
    valueRow: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    currentValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
    },
    divider: {
        fontSize: 12,
        color: "#666666",
        marginHorizontal: 2,
    },
    targetValue: {
        fontSize: 12,
        color: "#a0a0a0",
    },
    unit: {
        fontSize: 10,
        color: "#666666",
        marginTop: -2,
    },
    label: {
        marginTop: 12,
        fontSize: 13,
        fontWeight: "500",
        color: "#a0a0a0",
        textAlign: "center",
    },
});
