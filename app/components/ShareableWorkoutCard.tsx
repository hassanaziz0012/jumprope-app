import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { type Workout } from "../../lib/database";

interface ShareableWorkoutCardProps {
    workout: Workout;
}

export default function ShareableWorkoutCard({
    workout,
}: ShareableWorkoutCardProps) {
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes === 0) return `${remainingSeconds}s`;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const stats = [
        {
            label: "Duration",
            value: formatDuration(workout.duration),
            icon: "time-outline" as const,
        },
        {
            label: "Avg Skips/Min",
            value: Math.round(workout.avg_skips_per_minute).toString(),
            icon: "speedometer-outline" as const,
        },
        {
            label: "Trips",
            value: workout.trips.toString(),
            icon: "alert-circle-outline" as const,
        },
        {
            label: "Calories",
            value: workout.calories
                ? Math.round(workout.calories).toString()
                : null,
            icon: "flame-outline" as const,
        },
        {
            label: "Avg HR",
            value: workout.heart_rate_avg
                ? workout.heart_rate_avg.toString()
                : null,
            icon: "heart-outline" as const,
        },
        {
            label: "Max HR",
            value: workout.heart_rate_max
                ? workout.heart_rate_max.toString()
                : null,
            icon: "pulse-outline" as const,
        },
    ].filter((stat) => stat.value !== null);

    return (
        <View style={styles.container}>
            {/* Header / Date */}
            <View style={styles.header}>
                <Text style={styles.date}>{formatDate(workout.date)}</Text>
                {workout.trips === 0 && (
                    <View style={styles.perfectBadge}>
                        <Ionicons name="star" size={14} color="#ccfa53" />
                        <Text style={styles.perfectText}>Perfect!</Text>
                    </View>
                )}
            </View>

            {/* Total Skips - Hero Stat */}
            <View style={styles.heroStat}>
                <Text style={styles.heroValue}>
                    {workout.total_skips.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Total Skips</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                {stats.map((stat) => (
                    <View key={stat.label} style={styles.statItem}>
                        <View style={styles.iconValueRow}>
                            <Ionicons
                                name={stat.icon}
                                size={18}
                                color="#ff5526"
                            />
                            <Text style={styles.statValue}>{stat.value}</Text>
                        </View>
                        <Text style={styles.statLabel}>{stat.label}</Text>
                    </View>
                ))}
            </View>

            {/* Footer / Branding */}
            <View style={styles.footer}>
                <View style={styles.brandingRow}>
                    <Image
                        source={require("../../assets/images/icon.png")}
                        style={styles.logo}
                        contentFit="contain"
                    />
                    <Text style={styles.appName}>Jumprope Tracker</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#1a1a1a",
        padding: 24,
        borderRadius: 20,
        width: "100%",
        maxWidth: 360,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    date: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
        opacity: 0.9,
    },
    perfectBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(204, 250, 83, 0.15)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    perfectText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#ccfa53",
    },
    heroStat: {
        alignItems: "center",
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#2a2a2a",
        paddingBottom: 24,
    },
    heroValue: {
        fontSize: 56,
        fontWeight: "700",
        color: "#ffffff",
        lineHeight: 64,
        letterSpacing: -1,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 24,
        marginBottom: 32,
    },
    statItem: {
        width: "48%",
        alignItems: "center",
    },
    statLabel: {
        fontSize: 10,
        color: "#a0a0a0",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginTop: 4,
        fontWeight: "500",
    },
    iconValueRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ffffff",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: "#2a2a2a",
    },
    brandingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    logo: {
        width: 24,
        height: 24,
        borderRadius: 6,
    },
    appName: {
        fontSize: 14,
        fontWeight: "700",
        color: "#ffffff",
        opacity: 0.8,
    },
});
