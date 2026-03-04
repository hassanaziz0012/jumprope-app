import { useCallback, useState } from "react";
import { View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { getWorkout, deleteWorkout as deleteWorkoutDb, type Workout } from "../../lib/database";

export function useWorkoutDetails(id: string | string[] | undefined) {
    const router = useRouter();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const workoutId = typeof id === "string" ? parseInt(id, 10) : undefined;

    const loadWorkout = useCallback(async () => {
        try {
            setIsLoading(true);
            if (workoutId) {
                const data = await getWorkout(workoutId);
                setWorkout(data);
            }
        } catch (error) {
            console.error("Failed to load workout:", error);
        } finally {
            setIsLoading(false);
        }
    }, [workoutId]);

    // Refetch data when screen comes into focus (e.g., after editing)
    useFocusEffect(
        useCallback(() => {
            loadWorkout();
        }, [loadWorkout])
    );

    const deleteWorkout = async () => {
        if (!workoutId) return;
        setIsDeleting(true);
        try {
            await deleteWorkoutDb(workoutId);
            router.back();
        } catch (error) {
            console.error("Failed to delete workout:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const shareWorkout = async (cardRef: React.RefObject<any>) => {
        setIsSharing(true);
        try {
            const uri = await captureRef(cardRef, {
                format: "png",
                quality: 1,
            });
            await Sharing.shareAsync(uri);
        } catch (error) {
            console.error("Failed to share workout:", error);
        } finally {
            setIsSharing(false);
        }
    };

    return {
        workout,
        isLoading,
        isDeleting,
        isSharing,
        deleteWorkout,
        shareWorkout,
    };
}
