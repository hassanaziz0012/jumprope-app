import { Stack } from "expo-router";
import { StyleSheet, Text, View, Switch, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { getUserProfile, setSyncEnabled as setSyncEnabledDB } from "../lib/database";
import { runSync } from "../lib/sync";
import { AnimatedToggle } from "../components/AnimatedToggle";

export default function SyncScreen() {
    const insets = useSafeAreaInsets();
    const [syncEnabled, setSyncEnabled] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            const profile = await getUserProfile();
            if (profile) {
                setSyncEnabled(profile.sync_enabled);
                setLastSync(profile.last_sync);
            }
        };
        loadProfile();
    }, []);

    const handleToggleSync = async (value: boolean) => {
        setSyncEnabled(value);
        await setSyncEnabledDB(value);
        if (value) {
            await runSync();
        }
    };

    const handleDeleteConfirm = () => {
        // Placeholder for future implementation
        setShowDeleteModal(false);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Sync</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.card}>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Turn On Sync</Text>
                        <AnimatedToggle
                            value={syncEnabled}
                            onValueChange={handleToggleSync}
                            trackColor={{ false: "#2a2a2a", true: "#ff5526" }}
                            thumbColor="#ffffff"
                        />
                    </View>

                    <View style={styles.dateRow}>
                        <Text style={styles.dateValue}>
                            Last: {lastSync ? new Date(lastSync).toLocaleString() : "Never"}
                        </Text>
                    </View>

                    <View style={styles.buttonGroup}>
                        <Pressable style={styles.primaryButton} onPress={() => runSync()}>
                            <Text style={styles.primaryButtonText}>Sync Now</Text>
                        </Pressable>
                        <Pressable 
                            style={styles.secondaryButton} 
                            onPress={() => setShowDeleteModal(true)}
                        >
                            <Text style={styles.secondaryButtonText}>Delete Data</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Delete Confirmation Modal */}
            <Modal
                transparent={true}
                visible={showDeleteModal}
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Delete Data?</Text>
                        <Text style={styles.modalText}>
                            Are you sure you want to delete all your data and turn off sync? This action cannot be undone.
                        </Text>
                        <View style={styles.modalButtonGroup}>
                            <Pressable 
                                style={[styles.modalButton, styles.modalCancelButton]} 
                                onPress={() => setShowDeleteModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </Pressable>
                            <Pressable 
                                style={[styles.modalButton, styles.modalConfirmButton]} 
                                onPress={handleDeleteConfirm}
                            >
                                <Text style={styles.modalConfirmText}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#ffffff",
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: "normal",
        color: "#ffffff",
    },
    dateRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    dateValue: {
        fontSize: 14,
        color: "#a0a0a0",
        fontWeight: "400",
    },
    buttonGroup: {
        flexDirection: "row",
        gap: 12,
    },
    primaryButton: {
        flex: 1,
        backgroundColor: "#ff5526",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: "#2a2a2a",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        color: "#ff5526",
        fontSize: 16,
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalCard: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 12,
    },
    modalText: {
        fontSize: 16,
        color: "#a0a0a0",
        lineHeight: 24,
        marginBottom: 24,
    },
    modalButtonGroup: {
        flexDirection: "row",
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    modalCancelButton: {
        backgroundColor: "#2a2a2a",
    },
    modalConfirmButton: {
        backgroundColor: "rgba(255, 85, 38, 0.1)",
        borderWidth: 1,
        borderColor: "#ff5526",
    },
    modalCancelText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    modalConfirmText: {
        color: "#ff5526",
        fontSize: 16,
        fontWeight: "600",
    },
});
