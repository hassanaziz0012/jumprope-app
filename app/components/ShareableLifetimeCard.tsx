import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface LifetimeStats {
    totalWorkouts: number;
    maxSkips: number;
    maxAvgSkips: number;
    maxDuration: number;
}

interface ShareableLifetimeCardProps {
    stats: LifetimeStats;
}

export default function ShareableLifetimeCard({
    stats,
}: ShareableLifetimeCardProps) {
    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes === 0) return `${remainingSeconds}s`;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const statItems = [
        {
            label: "Best Skips",
            value: stats.maxSkips.toLocaleString(),
            icon: "trophy-outline" as const,
        },
        {
            label: "Best Avg Skips/Min",
            value: Math.round(stats.maxAvgSkips).toString(),
            icon: "speedometer-outline" as const,
        },
        {
            label: "Longest Workout",
            value: formatDuration(stats.maxDuration),
            icon: "timer-outline" as const,
        },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Lifetime Stats</Text>
            </View>

            {/* Total Workouts - Hero Stat */}
            <View style={styles.heroStat}>
                <Text style={styles.heroValue}>
                    {stats.totalWorkouts.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Total Workouts</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                {statItems.map((stat, index) => (
                    <View
                        key={stat.label}
                        style={[
                            styles.statItem,
                            index === 2 && styles.statItemFullWidth,
                        ]}
                    >
                        <View style={styles.iconValueRow}>
                            <Ionicons
                                name={stat.icon}
                                size={20}
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
        alignItems: "center",
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
        opacity: 0.9,
        textTransform: "uppercase",
        letterSpacing: 1,
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
    statItemFullWidth: {
        width: "100%",
        alignItems: "center",
    },
    statLabel: {
        fontSize: 12,
        color: "#a0a0a0",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginTop: 4,
        fontWeight: "500",
    },
    iconValueRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 2,
    },
    statValue: {
        fontSize: 20,
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
