import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getGoals, Goals, updateGoal } from "../lib/database";
import { goalTemplates, GoalKey, GoalTemplate } from "../lib/goalTemplates";

export default function GoalsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [goals, setGoals] = useState<Goals | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<GoalKey | null>(null);

    useFocusEffect(
        useCallback(() => {
            loadGoals();
        }, [])
    );

    const loadGoals = async () => {
        try {
            const data = await getGoals();
            setGoals(data);
        } catch (error) {
            console.error("Error loading goals:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleGoalChange = async (key: GoalKey, value: string) => {
        const numValue = value === "" ? null : parseFloat(value);

        // Validate input
        if (value !== "" && (isNaN(numValue!) || numValue! < 0)) {
            return;
        }

        // Update local state immediately for responsiveness
        setGoals((prev) => ({
            ...((prev ?? {
                id: 0,
                daily_skips: null,
                weekly_skips: null,
                weekly_workouts: null,
                daily_calories: null,
                weekly_calories: null,
                weekly_duration: null,
                skip_rate_goal: null,
                updated_at: new Date().toISOString(),
            }) as Goals),
            [key]: numValue,
        }));

        // Save to database
        setSavingKey(key);
        try {
            await updateGoal(key, numValue);
        } catch (error) {
            console.error("Error saving goal:", error);
        } finally {
            setSavingKey(null);
        }
    };

    const getGoalValue = (key: GoalKey): string => {
        if (!goals) return "";
        const value = goals[key];
        return value !== null && value !== undefined ? String(value) : "";
    };

    const renderGoalItem = (template: GoalTemplate) => {
        const currentValue = getGoalValue(template.key);
        const isSaving = savingKey === template.key;

        return (
            <View key={template.key} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={template.icon}
                            size={24}
                            color="#ff5526"
                        />
                    </View>
                    <View style={styles.goalInfo}>
                        <Text style={styles.goalTitle}>{template.title}</Text>
                        <Text style={styles.goalDescription}>
                            {template.description}
                        </Text>
                    </View>
                    <View style={styles.periodBadge}>
                        <Text style={styles.periodText}>{template.period}</Text>
                    </View>
                </View>

                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        value={currentValue}
                        onChangeText={(text) =>
                            handleGoalChange(template.key, text)
                        }
                        placeholder={template.placeholder}
                        placeholderTextColor="#666666"
                        keyboardType="numeric"
                    />
                    <Text style={styles.unitText}>{template.unit}</Text>
                    {isSaving && (
                        <ActivityIndicator
                            size="small"
                            color="#ccfa53"
                            style={styles.savingIndicator}
                        />
                    )}
                    {!isSaving && currentValue !== "" && (
                        <Pressable
                            onPress={() => handleGoalChange(template.key, "")}
                            style={styles.clearButton}
                        >
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color="#666666"
                            />
                        </Pressable>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.headerTitle}>Goals</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ff5526" />
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.sectionDescription}>
                        Set your fitness goals below. Changes are saved
                        automatically.
                    </Text>

                    {goalTemplates.map(renderGoalItem)}

                    <View style={styles.bottomPadding} />
                </ScrollView>
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
    },
    headerSpacer: {
        width: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 16,
    },
    sectionDescription: {
        fontSize: 14,
        color: "#a0a0a0",
        marginBottom: 24,
        lineHeight: 20,
    },
    goalCard: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    goalHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "rgba(255, 85, 38, 0.15)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    goalInfo: {
        flex: 1,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 4,
    },
    goalDescription: {
        fontSize: 13,
        color: "#a0a0a0",
    },
    periodBadge: {
        backgroundColor: "#2a2a2a",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    periodText: {
        fontSize: 11,
        color: "#ccfa53",
        fontWeight: "500",
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a2a2a",
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#ffffff",
        paddingVertical: 0,
    },
    unitText: {
        fontSize: 14,
        color: "#666666",
        marginLeft: 8,
    },
    savingIndicator: {
        marginLeft: 12,
    },
    clearButton: {
        marginLeft: 12,
        padding: 4,
    },
    bottomPadding: {
        height: 32,
    },
});
