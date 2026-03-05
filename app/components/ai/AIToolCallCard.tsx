import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Button from "../Button";
import { getToolDisplayInfo, formatToolArgs } from "../../../lib/aiCoach/ask";

interface AIToolCallCardProps {
    id: string;
    tool?: string;
    args?: Record<string, any>;
    completed?: boolean;
    status?: "pending" | "approved" | "rejected";
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

export default function AIToolCallCard({
    id,
    tool,
    args,
    completed,
    status,
    onApprove,
    onReject
}: AIToolCallCardProps) {
    const toolInfo = getToolDisplayInfo(tool || "");
    const formattedArgsList = formatToolArgs(tool || "", args);

    return (
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.toolCallCard}>
            <View style={styles.toolCallHeader}>
                <Ionicons name={toolInfo.icon as keyof typeof Ionicons.glyphMap} size={18} color="#ff5526" />
                <Text style={styles.toolCallTitle}>{toolInfo.title}</Text>
                {completed ? (
                    status === "pending" ? (
                        <View style={styles.pendingBadge}>
                            <Text style={styles.pendingBadgeText}>Needs Approval</Text>
                        </View>
                    ) : status === "approved" ? (
                        <Ionicons name="checkmark-circle" size={18} color="#ccfa53" style={styles.toolCallStatusIcon} />
                    ) : status === "rejected" ? (
                        <Ionicons name="close-circle" size={18} color="#ff5526" style={styles.toolCallStatusIcon} />
                    ) : (
                        <Ionicons name="checkmark-circle" size={18} color="#ccfa53" style={styles.toolCallStatusIcon} />
                    )
                ) : (
                    <ActivityIndicator size="small" color="#ccfa53" style={[styles.toolCallStatusIcon, { transform: [{ scale: 0.8 }] }]} />
                )}
            </View>
            {formattedArgsList && formattedArgsList.length > 0 && (
                <View style={styles.toolArgsGrid}>
                    {formattedArgsList.map((arg: { label: string; value: string }, i: number) => (
                        <View key={i} style={styles.toolArgPill}>
                            <Text style={styles.toolArgLabel}>{arg.label}</Text>
                            <Text style={styles.toolArgValue}>{arg.value}</Text>
                        </View>
                    ))}
                </View>
            )}
            {status === "pending" && (
                <View style={styles.toolCallActions}>
                    <Button 
                        title="Reject" 
                        onPress={() => onReject(id)}
                        variant="secondary"
                        style={styles.toolCallButton}
                    />
                    <View style={{ width: 8 }} />
                    <Button 
                        title="Approve" 
                        onPress={() => onApprove(id)}
                        variant="primary"
                        style={styles.toolCallButton}
                    />
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    toolCallCard: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 16,
        marginVertical: 4,
        alignSelf: "flex-start",
        width: "85%",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    toolCallHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    toolCallTitle: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 8,
        flex: 1,
    },
    toolCallStatusIcon: {
        marginLeft: 8,
    },
    pendingBadge: {
        backgroundColor: "rgba(255, 165, 0, 0.2)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    pendingBadgeText: {
        color: "#ffa500",
        fontSize: 10,
        fontWeight: "bold",
    },
    toolCallActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 12,
    },
    toolCallButton: {
        minHeight: 36,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    toolArgsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },
    toolArgPill: {
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    toolArgLabel: {
        color: "#888888",
        fontSize: 10,
        textTransform: "uppercase",
        fontWeight: "600",
        marginBottom: 2,
    },
    toolArgValue: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "500",
    },
});
