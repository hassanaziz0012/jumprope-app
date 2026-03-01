import { Stack } from "expo-router";
import { StyleSheet, Text, View, Switch, Pressable, Modal, ScrollView, ActivityIndicator, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { getUserProfile, setSyncEnabled as setSyncEnabledDB, markAllDataAsUnsynced } from "../lib/database";
import { runSync, deleteUserData } from "../lib/sync";
import { AnimatedToggle } from "../components/AnimatedToggle";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

export default function SyncScreen() {
    const insets = useSafeAreaInsets();
    const [syncEnabled, setSyncEnabled] = useState(false);
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [deleteResult, setDeleteResult] = useState<any>(null);
    const [syncToken, setSyncToken] = useState<string | null>(null);

    const [copied, setCopied] = useState(false);
    const toastTranslateY = useRef(new Animated.Value(200)).current;
    const iconScale = useRef(new Animated.Value(1)).current;

    const handleCopyToken = async () => {
        if (!syncToken || copied) return;
        await Clipboard.setStringAsync(syncToken);
        setCopied(true);
        
        iconScale.setValue(0.5);
        Animated.spring(iconScale, {
            toValue: 1,
            friction: 3,
            tension: 200,
            useNativeDriver: true,
        }).start();

        Animated.spring(toastTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
        }).start();

        setTimeout(() => {
            Animated.timing(toastTranslateY, {
                toValue: 200,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setCopied(false);
            });
        }, 1000);
    };

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

                {/* Debug Card */}
                <View style={styles.card}>
                    <View style={styles.debugHeader}>
                        <Text style={styles.debugTitle}>Debug Information</Text>
                    </View>
                    <Text style={styles.debugDisclaimer}>
                        Each user gets a unique sync token for cloud sync and AI features. This is shown here only for debugging purposes, and should not be used by end users. If I (the developer of this app) ask you for your sync token for debugging purposes, you can copy it below.
                    </Text>

                    <View style={styles.syncTokenContainer}>
                        <Text style={styles.syncTokenText} numberOfLines={1} ellipsizeMode="middle">
                            {syncToken || "Not Available"}
                        </Text>
                        <Pressable 
                            style={[
                                styles.copyButton,
                                copied && { backgroundColor: "rgba(204, 250, 83, 0.1)" }
                            ]}
                            onPress={handleCopyToken}
                        >
                            <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                                <Ionicons 
                                    name={copied ? "checkmark-outline" : "copy-outline"} 
                                    size={20} 
                                    color={copied ? "#ccfa53" : "#ff5526"} 
                                />
                            </Animated.View>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Copy Toast */}
            <Animated.View
                style={[
                    styles.toastContainer,
                    { transform: [{ translateY: toastTranslateY }], bottom: Math.max(insets.bottom, 20) + 20 }
                ]}
                pointerEvents="none"
            >
                <View style={styles.toastContent}>
                    <Ionicons name="checkmark-circle" size={20} color="#ccfa53" style={styles.toastIcon} />
                    <Text style={styles.toastText}>Copied to clipboard</Text>
                </View>
            </Animated.View>

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

                        <Pressable 
                            style={[styles.modalButton, styles.modalCancelButton]} 
                            onPress={() => setShowSuccessModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Close</Text>
                        </Pressable>
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
    debugHeader: {
        marginBottom: 12,
    },
    debugTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ffffff",
    },
    debugDisclaimer: {
        fontSize: 14,
        color: "#a0a0a0",
        lineHeight: 20,
        marginBottom: 16,
    },
    syncTokenContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a2a2a",
        padding: 12,
        borderRadius: 8,
    },
    syncTokenText: {
        flex: 1,
        color: "#ffffff",
        fontSize: 14,
        fontFamily: "monospace",
    },
    copyButton: {
        padding: 8,
        marginLeft: 8,
        backgroundColor: "rgba(255, 85, 38, 0.1)",
        borderRadius: 6,
    },
    toastContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 9999,
    },
    toastContent: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: "#2a2a2a",
    },
    toastIcon: {
        marginRight: 8,
    },
    toastText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
});
