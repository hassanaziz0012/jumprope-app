import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { CHART_TYPES, METRICS, TIME_RANGES } from "../../lib/charts";
import { addChart } from "../../lib/database";

interface AddChartModalProps {
    visible: boolean;
    onClose: () => void;
    onAdded?: () => void;
}

export default function AddChartModal({
    visible,
    onClose,
    onAdded,
}: AddChartModalProps) {
    const [selectedMetric, setSelectedMetric] = useState<string>(
        METRICS.TOTAL_SKIPS
    );
    const [selectedType, setSelectedType] = useState<string>(CHART_TYPES.BAR);
    const [selectedTimeRange, setSelectedTimeRange] = useState<string>(
        TIME_RANGES.DAYS_7
    );

    const handleSave = async () => {
        try {
            await addChart({
                metric: selectedMetric,
                type: selectedType as "bar" | "area",
                timeRange: selectedTimeRange,
            });
            if (onAdded) onAdded();
            onClose();
        } catch (error) {
            console.error("Failed to save chart:", error);
        }
    };

    // Helper to render a selection group
    const renderSelectionGroup = (
        title: string,
        options: Record<string, string>,
        selected: string,
        onSelect: (value: string) => void
    ) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.chipsContainer}>
                {Object.values(options).map((option) => {
                    const isSelected = selected === option;
                    return (
                        <Pressable
                            key={option}
                            style={[
                                styles.chip,
                                isSelected && styles.chipSelected,
                            ]}
                            onPress={() => onSelect(option)}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    isSelected && styles.chipTextSelected,
                                ]}
                            >
                                {formatLabel(option)}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );

    const formatLabel = (str: string) => {
        // Simple formatter: "totalSkips" -> "Total Skips", "7d" -> "7 Days"
        if (str === "7d") return "7 Days";
        if (str === "30d") return "30 Days";
        if (str === "90d") return "90 Days";

        return str
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Add New Chart</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#ffffff" />
                        </Pressable>
                    </View>

                    <ScrollView style={styles.content}>
                        {renderSelectionGroup(
                            "Metric",
                            METRICS,
                            selectedMetric,
                            setSelectedMetric
                        )}
                        {renderSelectionGroup(
                            "Chart Type",
                            CHART_TYPES,
                            selectedType,
                            setSelectedType
                        )}
                        {renderSelectionGroup(
                            "Time Range",
                            TIME_RANGES,
                            selectedTimeRange,
                            setSelectedTimeRange
                        )}
                    </ScrollView>

                    <View style={styles.footer}>
                        <Pressable
                            style={styles.cancelButton}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>
                                Save Chart
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        padding: 20,
    },
    modalContainer: {
        backgroundColor: "#1a1a1a",
        borderRadius: 24,
        maxHeight: "80%",
        width: "100%",
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#2a2a2a",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#a0a0a0",
        marginBottom: 12,
    },
    chipsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    chip: {
        backgroundColor: "#2a2a2a",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "transparent",
    },
    chipSelected: {
        backgroundColor: "rgba(204, 250, 83, 0.15)", // Primary Lime with lo opacity
        borderColor: "#ccfa53",
    },
    chipText: {
        color: "#a0a0a0",
        fontSize: 14,
        fontWeight: "500",
    },
    chipTextSelected: {
        color: "#ccfa53", // Primary Lime
        fontWeight: "600",
    },
    footer: {
        flexDirection: "row",
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#2a2a2a",
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#2a2a2a",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    saveButton: {
        flex: 1,
        backgroundColor: "#ff5526", // Primary Orange
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});
