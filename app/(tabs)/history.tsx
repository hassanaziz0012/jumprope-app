import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getWorkouts, type Workout } from "../../lib/database";
import WorkoutCard from "../components/WorkoutCard";

export default function HistoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadWorkouts();
        }, [])
    );

    const loadWorkouts = async () => {
        try {
            const data = await getWorkouts();
            setWorkouts(data);
        } catch (error) {
            console.error("Failed to load workouts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWorkoutPress = (workoutId: number) => {
        router.push(`/workout/${workoutId}`);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Workout History</Text>
                <Text style={styles.subtitle}>
                    {workouts.length > 0
                        ? `${workouts.length} workout${
                              workouts.length !== 1 ? "s" : ""
                          } logged`
                        : "Your workout history will appear here"}
                </Text>
            </View>

            {isLoading ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Loading...</Text>
                </View>
            ) : workouts.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No workouts yet</Text>
                    <Text style={styles.emptySubtext}>
                        Log your first workout to get started!
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={workouts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <WorkoutCard
                            workout={item}
                            onPress={() => handleWorkoutPress(item.id)}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "#a0a0a0",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#a0a0a0",
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#666666",
        textAlign: "center",
    },
});
