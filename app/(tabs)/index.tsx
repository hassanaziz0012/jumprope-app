import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    addRestDay,
    getUserProfile,
    getWorkouts,
    removeRestDay,
    type UserProfile,
    type Workout,
} from "../../lib/database";
import { getGoalProgress, type GoalProgressItem } from "../../lib/goalTracking";
import {
    getCurrentStreak,
    getWeeklyStreakData,
    type DayStreakData,
} from "../../lib/streaks";
import Button from "../components/Button";
import FloatingActionButton from "../components/FloatingActionButton";
import GoalTrackingCard from "../components/GoalTrackingCard";
import RestDayModal from "../components/RestDayModal";
import StreakCard from "../components/StreakCard";
import WorkoutCard from "../components/WorkoutCard";

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [goals, setGoals] = useState<GoalProgressItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Streak state
    const [currentStreak, setCurrentStreak] = useState(0);
    const [weeklyData, setWeeklyData] = useState<DayStreakData[]>([]);
    const [selectedDay, setSelectedDay] = useState<DayStreakData | null>(null);
    const [isRestDayModalVisible, setIsRestDayModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            const [
                profileData,
                workoutsData,
                goalsData,
                streakData,
                weeklyStreakData,
            ] = await Promise.all([
                getUserProfile(),
                getWorkouts(5),
                getGoalProgress(),
                getCurrentStreak(),
                getWeeklyStreakData(),
            ]);
            setUser(profileData);
            setWorkouts(workoutsData);
            setGoals(goalsData);
            setCurrentStreak(streakData);
            setWeeklyData(weeklyStreakData);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadStreakData = async () => {
        try {
            const [streakData, weeklyStreakData] = await Promise.all([
                getCurrentStreak(),
                getWeeklyStreakData(),
            ]);
            setCurrentStreak(streakData);
            setWeeklyData(weeklyStreakData);
        } catch (error) {
            console.error("Failed to load streak data:", error);
        }
    };

    const handleLogWorkout = () => {
        router.push("/log-workout");
    };

    const handleViewMore = () => {
        router.push("/history");
    };

    const handleDayPress = (day: DayStreakData) => {
        setSelectedDay(day);
        setIsRestDayModalVisible(true);
    };

    const handleStreakCardPress = () => {
        router.push("/streak-history");
    };

    const handleMarkRestDay = async () => {
        if (!selectedDay) return;
        await addRestDay(selectedDay.dateStr);
        setIsRestDayModalVisible(false);
        await loadStreakData();
    };

    const handleRemoveRestDay = async () => {
        if (!selectedDay) return;
        await removeRestDay(selectedDay.dateStr);
        setIsRestDayModalVisible(false);
        await loadStreakData();
    };

    const formatDayLabel = (day: DayStreakData): string => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            month: "short",
            day: "numeric",
        };
        return day.date.toLocaleDateString("en-US", options);
    };

    const greeting = user?.name ? `Hello, ${user.name}` : "Hello, Athlete";

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <View style={styles.content}>
                <FlatList
                    data={workouts}
                    keyExtractor={(item) => item.id.toString()}
                    ListHeaderComponent={
                        <>
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

                            {/* Streaks */}
                            <StreakCard
                                currentStreak={currentStreak}
                                weeklyData={weeklyData}
                                onDayPress={handleDayPress}
                                onPress={handleStreakCardPress}
                            />

                            {/* Goals */}
                            <GoalTrackingCard goals={goals} />

                            {/* Recent Workouts Title */}
                            <Text style={styles.sectionTitle}>
                                Recent Workouts
                            </Text>
                        </>
                    }
                    renderItem={({ item }) => (
                        <WorkoutCard
                            workout={item}
                            onPress={() => router.push(`/workout/${item.id}`)}
                        />
                    )}
                    ListEmptyComponent={
                        isLoading ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>Loading...</Text>
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>
                                    No workouts yet
                                </Text>
                                <Text style={styles.emptySubtext}>
                                    Log your first workout to get started!
                                </Text>
                            </View>
                        )
                    }
                    ListFooterComponent={
                        !isLoading && workouts.length > 0 ? (
                            <Button
                                title="More"
                                onPress={handleViewMore}
                                variant="ghost"
                                icon="chevron-forward"
                            />
                        ) : null
                    }
                    contentContainerStyle={{ paddingBottom: 80 }} // Add padding for FAB
                    showsVerticalScrollIndicator={false}
                />
            </View>
            {/* Floating Action Button */}
            <FloatingActionButton onPress={handleLogWorkout} />

            {/* Rest Day Modal */}
            {selectedDay && (
                <RestDayModal
                    visible={isRestDayModalVisible}
                    date={selectedDay.dateStr}
                    dayLabel={formatDayLabel(selectedDay)}
                    isRestDay={selectedDay.isRestDay}
                    hasWorkout={selectedDay.hasWorkout}
                    onMarkRestDay={handleMarkRestDay}
                    onRemoveRestDay={handleRemoveRestDay}
                    onClose={() => setIsRestDayModalVisible(false)}
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
        marginBottom: 16,
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
