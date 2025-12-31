import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    getUserProfile,
    getWorkouts,
    type UserProfile,
    type Workout,
} from "../../lib/database";
import Button from "../components/Button";
import FloatingActionButton from "../components/FloatingActionButton";
import WorkoutCard from "../components/WorkoutCard";

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const [profileData, workoutsData] = await Promise.all([
                getUserProfile(),
                getWorkouts(5),
            ]);
            setUser(profileData);
            setWorkouts(workoutsData);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogWorkout = () => {
        router.push("/log-workout");
    };

    const handleViewMore = () => {
        router.push("/history");
    };

    const greeting = user?.name ? `Hello, ${user.name}` : "Hello, Athlete";

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>{greeting}</Text>
                    <Text style={styles.subtitle}>
                        Ready to jump some rope?
                    </Text>
                </View>

                {/* CTA Button */}
                <Button
                    title="Log new workout"
                    onPress={handleLogWorkout}
                    icon="add-circle"
                    style={styles.ctaButton}
                />

                {/* Recent Workouts */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Workouts</Text>

                    {isLoading ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Loading...</Text>
                        </View>
                    ) : workouts.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                No workouts yet
                            </Text>
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
                                    onPress={() =>
                                        router.push(`/workout/${item.id}`)
                                    }
                                />
                            )}
                            scrollEnabled={false}
                            ListFooterComponent={
                                workouts.length > 0 ? (
                                    <Button
                                        title="More"
                                        onPress={handleViewMore}
                                        variant="ghost"
                                        icon="chevron-forward"
                                    />
                                ) : null
                            }
                        />
                    )}
                </View>
            </View>

            {/* Floating Action Button */}
            <FloatingActionButton onPress={handleLogWorkout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    header: {
        marginBottom: 24,
    },
    greeting: {
        fontSize: 32,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: "#a0a0a0",
    },
    ctaButton: {
        marginBottom: 32,
    },
    section: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 16,
    },
    emptyState: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 32,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#a0a0a0",
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#666666",
        textAlign: "center",
    },
});
