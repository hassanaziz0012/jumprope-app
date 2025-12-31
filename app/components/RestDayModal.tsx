import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Button from "./Button";

interface RestDayModalProps {
    visible: boolean;
    date: string; // YYYY-MM-DD format
    dayLabel: string; // e.g., "Tuesday, Dec 31"
    isRestDay: boolean;
    hasWorkout: boolean;
    onMarkRestDay: () => void;
    onRemoveRestDay: () => void;
    onClose: () => void;
}

export default function RestDayModal({
    visible,
    date,
    dayLabel,
    isRestDay,
    hasWorkout,
    onMarkRestDay,
    onRemoveRestDay,
    onClose,
}: RestDayModalProps) {
    const getStatusMessage = () => {
        if (hasWorkout && isRestDay) {
            return "You logged a workout and marked this as a rest day.";
        }
        if (hasWorkout) {
            return "You logged a workout on this day.";
        }
        if (isRestDay) {
            return "This day is marked as a rest day.";
        }
        return "No workout logged for this day.";
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable
                    style={styles.modal}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name={isRestDay ? "bed" : "calendar"}
                                size={28}
                                color="#ff5526"
                            />
                        </View>
                        <Text style={styles.title}>{dayLabel}</Text>
                    </View>

                    {/* Status */}
                    <View style={styles.statusContainer}>
                        {hasWorkout && (
                            <View style={styles.statusBadge}>
                                <Ionicons
                                    name="checkmark-circle"
                                    size={16}
                                    color="#ccfa53"
                                />
                                <Text style={styles.statusBadgeText}>
                                    Workout logged
                                </Text>
                            </View>
                        )}
                        {isRestDay && (
                            <View style={styles.statusBadge}>
                                <Ionicons
                                    name="bed"
                                    size={16}
                                    color="#ff5526"
                                />
                                <Text style={styles.statusBadgeText}>
                                    Rest day
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.message}>{getStatusMessage()}</Text>

                    {/* Actions */}
                    <View style={styles.buttons}>
                        <Button
                            title="Close"
                            onPress={onClose}
                            variant="secondary"
                            style={styles.button}
                        />
                        {isRestDay ? (
                            <Button
                                title="Remove Rest Day"
                                onPress={onRemoveRestDay}
                                variant="primary"
                                style={styles.button}
                            />
                        ) : (
                            <Button
                                title="Mark Rest Day"
                                onPress={onMarkRestDay}
                                variant="primary"
                                style={styles.button}
                            />
                        )}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    modal: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 340,
    },
    header: {
        alignItems: "center",
        marginBottom: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "rgba(255, 85, 38, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
        textAlign: "center",
    },
    statusContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#2a2a2a",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    statusBadgeText: {
        fontSize: 12,
        color: "#ffffff",
        fontWeight: "500",
    },
    message: {
        fontSize: 14,
        color: "#a0a0a0",
        marginBottom: 24,
        textAlign: "center",
        lineHeight: 20,
    },
    buttons: {
        flexDirection: "row",
        gap: 12,
    },
    button: {
        flex: 1,
    },
});
