import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { deleteWorkout, getWorkout, type Workout } from "../../lib/database";
import Button from "../components/Button";
import ConfirmationModal from "../components/ConfirmationModal";

export default function WorkoutDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadWorkout = useCallback(async () => {
        try {
            setIsLoading(true);
            if (id) {
                const data = await getWorkout(parseInt(id, 10));
                setWorkout(data);
            }
        } catch (error) {
            console.error("Failed to load workout:", error);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    // Refetch data when screen comes into focus (e.g., after editing)
    useFocusEffect(
        useCallback(() => {
            loadWorkout();
        }, [loadWorkout])
    );

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes === 0) return `${remainingSeconds} seconds`;
        if (remainingSeconds === 0)
            return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const handleEdit = () => {
        router.push(`/workout/edit?id=${id}`);
    };

    const handleDelete = async () => {
        if (!id) return;
        setIsDeleting(true);
        try {
            await deleteWorkout(parseInt(id, 10));
            setShowDeleteModal(false);
            router.back();
        } catch (error) {
            console.error("Failed to delete workout:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
                <View style={styles.loadingState}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </View>
        );
    }

    if (!workout) {
        return (
            <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <View style={styles.errorState}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={48}
                        color="#666666"
                    />
                    <Text style={styles.errorText}>Workout not found</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.back()}
                    hitSlop={12}
                >
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.headerTitle}>Workout Details</Text>
                <Pressable
                    style={styles.editButton}
                    onPress={handleEdit}
                    hitSlop={12}
                >
                    <Ionicons name="pencil" size={20} color="#ff5526" />
                </Pressable>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Date & Time */}
                <View style={styles.dateSection}>
                    <Text style={styles.date}>{formatDate(workout.date)}</Text>
                    <Text style={styles.time}>{formatTime(workout.date)}</Text>
                </View>

                {/* Perfect Badge */}
                {workout.trips === 0 && (
                    <View style={styles.perfectBadge}>
                        <Ionicons name="star" size={16} color="#ccfa53" />
                        <Text style={styles.perfectText}>Perfect Workout!</Text>
                    </View>
                )}

                {/* Main Stats */}
                <View style={styles.statsCard}>
                    <View style={styles.mainStat}>
                        <Text style={styles.mainStatValue}>
                            {workout.total_skips.toLocaleString()}
                        </Text>
                        <Text style={styles.mainStatLabel}>Total Skips</Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <View style={styles.statValueRow}>
                                <Ionicons
                                    name="time-outline"
                                    size={20}
                                    color="#ffffff"
                                />
                                <Text style={styles.statValue}>
                                    {formatDuration(workout.duration)}
                                </Text>
                            </View>
                            <Text style={styles.statLabel}>Duration</Text>
                        </View>

                        <View style={styles.stat}>
                            <View style={styles.statValueRow}>
                                <Ionicons
                                    name="speedometer-outline"
                                    size={20}
                                    color="#ffffff"
                                />
                                <Text style={styles.statValue}>
                                    {Math.round(workout.avg_skips_per_minute)}
                                </Text>
                            </View>
                            <Text style={styles.statLabel}>Avg Skips/Min</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <View style={styles.statValueRow}>
                                <Ionicons
                                    name="alert-circle-outline"
                                    size={20}
                                    color="#ffffff"
                                />
                                <Text style={styles.statValue}>
                                    {workout.trips}
                                </Text>
                            </View>
                            <Text style={styles.statLabel}>Trips</Text>
                        </View>

                        {workout.calories && (
                            <View style={styles.stat}>
                                <View style={styles.statValueRow}>
                                    <Ionicons
                                        name="flame-outline"
                                        size={20}
                                        color="#ffffff"
                                    />
                                    <Text style={styles.statValue}>
                                        {Math.round(workout.calories)}
                                    </Text>
                                </View>
                                <Text style={styles.statLabel}>Calories</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Heart Rate Stats */}
                {(workout.heart_rate_avg || workout.heart_rate_max) && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="heart" size={20} color="#ff5526" />
                            <Text style={styles.cardTitle}>Heart Rate</Text>
                        </View>

                        <View style={styles.statsRow}>
                            {workout.heart_rate_avg && (
                                <View style={styles.stat}>
                                    <Text style={styles.statValue}>
                                        {workout.heart_rate_avg}
                                    </Text>
                                    <Text style={styles.statLabel}>
                                        Avg BPM
                                    </Text>
                                </View>
                            )}

                            {workout.heart_rate_max && (
                                <View style={styles.stat}>
                                    <Text style={styles.statValue}>
                                        {workout.heart_rate_max}
                                    </Text>
                                    <Text style={styles.statLabel}>
                                        Max BPM
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Notes */}
                {workout.notes && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons
                                name="document-text"
                                size={20}
                                color="#a0a0a0"
                            />
                            <Text style={styles.cardTitle}>Notes</Text>
                        </View>
                        <Text style={styles.notes}>{workout.notes}</Text>
                    </View>
                )}

                {/* Delete Button */}
                <View style={styles.deleteSection}>
                    <Button
                        title="Delete Workout"
                        onPress={() => setShowDeleteModal(true)}
                        variant="secondary"
                        icon="trash-outline"
                        style={styles.deleteButton}
                    />
                </View>
            </ScrollView>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                visible={showDeleteModal}
                title="Delete Workout"
                message="Are you sure you want to delete this workout? This action cannot be undone."
                confirmText={isDeleting ? "Deleting..." : "Delete"}
                cancelText="Cancel"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
                isDestructive
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
        textAlign: "center",
    },
    editButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "flex-end",
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    loadingState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#a0a0a0",
    },
    errorState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        fontSize: 16,
        color: "#666666",
        marginTop: 12,
    },
    dateSection: {
        marginBottom: 20,
    },
    date: {
        fontSize: 24,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 4,
    },
    time: {
        fontSize: 16,
        color: "#a0a0a0",
    },
    perfectBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(204, 250, 83, 0.15)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 20,
        alignSelf: "flex-start",
    },
    perfectText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#ccfa53",
        marginLeft: 8,
    },
    statsCard: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    mainStat: {
        alignItems: "center",
        marginBottom: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#2a2a2a",
    },
    mainStatValue: {
        fontSize: 48,
        fontWeight: "700",
        color: "#ffffff",
    },
    mainStatLabel: {
        fontSize: 14,
        color: "#a0a0a0",
        marginTop: 4,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 16,
    },
    stat: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "700",
        color: "#ffffff",
    },
    statLabel: {
        fontSize: 12,
        color: "#666666",
        marginTop: 4,
    },
    statValueRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    card: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
        marginLeft: 8,
    },
    notes: {
        fontSize: 14,
        color: "#a0a0a0",
        lineHeight: 22,
    },
    deleteSection: {
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: "#2a2a2a",
    },
    deleteButton: {
        borderColor: "#dc3545",
    },
});
