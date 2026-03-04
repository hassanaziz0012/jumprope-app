import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { type Workout } from "../../lib/database";
import Button from "../components/Button";
import ShareableWorkoutCard from "../components/ShareableWorkoutCard";

interface ShareWorkoutModalProps {
    visible: boolean;
    onClose: () => void;
    workout: Workout;
    isSharing: boolean;
    onShare: () => void;
    cardRef: React.RefObject<View | null>;
}

export default function ShareWorkoutModal({
    visible,
    onClose,
    workout,
    isSharing,
    onShare,
    cardRef,
}: ShareWorkoutModalProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Share Workout</Text>
                        <Pressable onPress={onClose} hitSlop={12}>
                            <Ionicons name="close" size={24} color="#ffffff" />
                        </Pressable>
                    </View>

                    <View style={styles.previewContainer}>
                        <View
                            ref={cardRef}
                            collapsable={false}
                            style={styles.cardCaptureContainer}
                        >
                            <ShareableWorkoutCard workout={workout} />
                        </View>
                    </View>

                    <View style={styles.modalActions}>
                        <Button
                            title={isSharing ? "Preparing..." : "Share Workout"}
                            onPress={onShare}
                            icon={isSharing ? undefined : "share-outline"}
                            style={styles.shareButton}
                            disabled={isSharing}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#1a1a1a",
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
    },
    previewContainer: {
        marginBottom: 32,
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    cardCaptureContainer: {
        backgroundColor: "#1a1a1a", // Ensure background for capture
    },
    modalActions: {
        width: "100%",
    },
    shareButton: {
        backgroundColor: "#ff5526",
    },
});
