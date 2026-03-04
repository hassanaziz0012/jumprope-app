import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWorkoutDetails } from "../hooks/useWorkoutDetails";
import Button from "../components/Button";
import ConfirmationModal from "../components/ConfirmationModal";
import WorkoutDetailHeader from "./WorkoutDetailHeader";
import WorkoutMainStats from "./WorkoutMainStats";
import HeartRateCard from "./HeartRateCard";
import ShareWorkoutModal from "./ShareWorkoutModal";
import WorkoutNotFound from "./WorkoutNotFound";

export default function WorkoutDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const {
        workout,
        isLoading,
        isDeleting,
        isSharing,
        deleteWorkout,
        shareWorkout,
    } = useWorkoutDetails(id);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const cardRef = useRef<View>(null);

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

    const handleEdit = () => {
        router.push(`/workout/edit?id=${id}`);
    };

    const handleDelete = async () => {
        await deleteWorkout();
        setShowDeleteModal(false);
    };

    const handleShare = async () => {
        await shareWorkout(cardRef);
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
        return <WorkoutNotFound />;
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            {/* Header */}
            <WorkoutDetailHeader
                onBack={() => router.back()}
                onShare={() => setShowShareModal(true)}
                onEdit={handleEdit}
            />

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
                <WorkoutMainStats workout={workout} />

                {/* Heart Rate Stats */}
                <HeartRateCard workout={workout} />

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

                {/* Timestamps */}
                <View style={styles.timestampSection}>
                    {workout.created_at && (
                        <View style={styles.timestampRow}>
                            <Ionicons name="calendar-outline" size={14} color="#666666" />
                            <Text style={styles.timestampText}>
                                {formatDate(workout.created_at)} at {formatTime(workout.created_at)}
                            </Text>
                        </View>
                    )}
                    {workout.updated_at && (
                        <View style={styles.timestampRow}>
                            <Ionicons name="sync-outline" size={14} color="#666666" />
                            <Text style={styles.timestampText}>
                                {formatDate(workout.updated_at)} at {formatTime(workout.updated_at)}
                            </Text>
                        </View>
                    )}
                </View>

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

            {/* Share Modal */}
            <ShareWorkoutModal
                visible={showShareModal}
                onClose={() => setShowShareModal(false)}
                workout={workout}
                isSharing={isSharing}
                onShare={handleShare}
                cardRef={cardRef}
            />

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
    backButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "flex-start",
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
    timestampSection: {
        marginTop: 24,
        alignItems: "center",
        gap: 6,
    },
    timestampRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    timestampText: {
        fontSize: 12,
        color: "#666666",
    },
});
