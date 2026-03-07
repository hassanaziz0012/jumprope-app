import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface WeeklyDigestHeaderProps {
    onHistoryPress: () => void;
}

export default function WeeklyDigestHeader({ onHistoryPress }: WeeklyDigestHeaderProps) {
    return (
        <View style={styles.header}>
            <View />
            <Pressable
                style={({ pressed }) => [
                    styles.historyButton,
                    pressed && styles.historyButtonPressed,
                ]}
                onPress={onHistoryPress}
            >
                <Ionicons name="time-outline" size={24} color="#ffffff" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    historyButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#1a1a1a",
        justifyContent: "center",
        alignItems: "center",
    },
    historyButtonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
});
