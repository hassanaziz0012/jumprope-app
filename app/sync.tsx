import { Stack } from "expo-router";
import { StyleSheet, Text, View, Pressable, Modal, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { getUserProfile, setSyncEnabled as setSyncEnabledDB, markAllDataAsUnsynced } from "../lib/database";
import { runSync, deleteUserData } from "../lib/sync";
import { SyncSettingsCard } from "./components/sync/SyncSettingsCard";
import { SyncDebugCard } from "./components/sync/SyncDebugCard";

export default function SyncScreen() {
    const insets = useSafeAreaInsets();
    const [syncEnabled, setSyncEnabled] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [deleteResult, setDeleteResult] = useState<any>(null);
    const [syncToken, setSyncToken] = useState<string | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            const profile = await getUserProfile();
            if (profile) {
                setSyncEnabled(profile.sync_enabled);
                setLastSync(profile.last_sync);
                setSyncToken(profile.sync_token);
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

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        try {
            await markAllDataAsUnsynced();
            const result = await deleteUserData();
            
            await setSyncEnabledDB(false);
            setSyncEnabled(false);
            setDeleteResult(result);
            
            setShowDeleteModal(false);
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error deleting user data:", error);
            setShowDeleteModal(false);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Sync</Text>
            </View>

            <View style={styles.content}>
                <SyncSettingsCard
                    syncEnabled={syncEnabled}
                    onToggleSync={handleToggleSync}
                    lastSync={lastSync}
                    onSyncNow={() => runSync()}
                    onDeleteData={() => setShowDeleteModal(true)}
                />

                <SyncDebugCard syncToken={syncToken} />
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
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <ActivityIndicator color="#ff5526" />
                                ) : (
                                    <Text style={styles.modalConfirmText}>Delete</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal
                transparent={true}
                visible={showSuccessModal}
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { maxHeight: '80%' }]}>
                        <Text style={styles.modalTitle}>Success</Text>
                        <Text style={styles.modalText}>
                            {deleteResult?.message || "User data successfully deleted"}
                        </Text>
                        
                        {deleteResult?.statistics && (
                            <View style={styles.statsContainer}>
                                <Text style={styles.statsTitle}>Deleted Items</Text>
                                <ScrollView style={styles.statsScrollView} showsVerticalScrollIndicator={false}>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Workouts</Text>
                                        <Text style={styles.statValue}>{deleteResult.statistics.workouts_deleted}</Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Rest Days</Text>
                                        <Text style={styles.statValue}>{deleteResult.statistics.rest_days_deleted}</Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Goals</Text>
                                        <Text style={styles.statValue}>{deleteResult.statistics.goals_deleted}</Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Charts</Text>
                                        <Text style={styles.statValue}>{deleteResult.statistics.charts_deleted}</Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Conversations</Text>
                                        <Text style={styles.statValue}>{deleteResult.statistics.conversations_deleted}</Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Messages</Text>
                                        <Text style={styles.statValue}>{deleteResult.statistics.conversation_messages_deleted}</Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>User Profile</Text>
                                        <Text style={styles.statValue}>{deleteResult.statistics.user_profile_deleted}</Text>
                                    </View>
                                </ScrollView>
                            </View>
                        )}

                        <View style={styles.modalButtonGroup}>
                            <Pressable 
                                style={[styles.modalButton, styles.modalCancelButton]} 
                                onPress={() => setShowSuccessModal(false)}
                            >
                                <Text style={styles.modalCancelText}>OK</Text>
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
    statsContainer: {
        backgroundColor: "#0a0a0a",
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
    },
    statsTitle: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 12,
    },
    statsScrollView: {
        maxHeight: 200,
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#1a1a1a",
    },
    statLabel: {
        color: "#a0a0a0",
        fontSize: 14,
    },
    statValue: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
});
