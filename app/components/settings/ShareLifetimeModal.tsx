import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import { useRef } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import ShareableLifetimeCard, { type LifetimeStats } from "../ShareableLifetimeCard";

interface ShareLifetimeModalProps {
    visible: boolean;
    onClose: () => void;
    stats: LifetimeStats | null;
    loadingStats: boolean;
}

export default function ShareLifetimeModal({
    visible,
    onClose,
    stats,
    loadingStats,
}: ShareLifetimeModalProps) {
    const cardRef = useRef<View>(null);

    const handleShareContent = async () => {
        try {
            const uri = await captureRef(cardRef, {
                format: "png",
                quality: 1,
            });
            await Sharing.shareAsync(uri);
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.modalOverlay}
                onPress={onClose}
            >
                <View style={styles.modalContent}>
                    {loadingStats ? (
                        <ActivityIndicator
                            size="large"
                            color="#ff5526"
                            style={styles.loader}
                        />
                    ) : stats ? (
                        <View style={styles.shareContainer}>
                            <View
                                ref={cardRef}
                                style={styles.cardContainer}
                                collapsable={false}
                            >
                                <ShareableLifetimeCard stats={stats} />
                            </View>
                            <Pressable
                                style={styles.shareButton}
                                onPress={handleShareContent}
                            >
                                <Text style={styles.shareButtonText}>
                                    Share
                                </Text>
                                <Ionicons
                                    name="share-outline"
                                    size={20}
                                    color="#ffffff"
                                />
                            </Pressable>
                        </View>
                    ) : (
                        <>
                            <Ionicons
                                name="share-social"
                                size={48}
                                color="#ff5526"
                            />
                            <Text style={styles.modalTitle}>Share</Text>
                            <Text style={styles.modalSubtitle}>
                                No workouts found to share.
                            </Text>
                        </>
                    )}
                    <Pressable
                        style={styles.modalCloseButton}
                        onPress={onClose}
                    >
                        <Text style={styles.modalCloseText}>Close</Text>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    modalContent: {
        backgroundColor: "#1a1a1a",
        borderRadius: 20,
        padding: 32,
        width: "100%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#ffffff",
        marginTop: 16,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        color: "#a0a0a0",
        textAlign: "center",
        marginBottom: 8,
    },
    shareContainer: {
        alignItems: "center",
        width: "100%",
    },
    cardContainer: {
        width: "100%",
        marginBottom: 24,
    },
    shareButton: {
        backgroundColor: "#ff5526",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        gap: 8,
        width: "100%",
    },
    shareButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
    },
    modalCloseButton: {
        backgroundColor: "#2a2a2a",
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
    loader: {
        marginVertical: 40,
    },
});
