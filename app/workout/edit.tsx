import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getWorkout, updateWorkout, Workout } from "../../lib/database";
import WorkoutForm from "../components/WorkoutForm";

export default function EditWorkoutScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [workout, setWorkout] = useState<Workout | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadWorkout = useCallback(async () => {
        try {
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

    useEffect(() => {
        loadWorkout();
    }, [loadWorkout]);

    const handleSubmit = async (data: Parameters<typeof updateWorkout>[1]) => {
        if (id) {
            await updateWorkout(parseInt(id, 10), data);
            router.back();
        }
    };

    const handleCancel = () => {
        router.back();
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
                <View style={styles.errorState}>
                    <Text style={styles.errorText}>Workout not found</Text>
                </View>
            </View>
        );
    }

    return (
        <WorkoutForm
            initialData={workout}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            title="Edit Workout"
            submitLabel="Update"
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
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
    },
});
