import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    getNotificationSettings,
    NotificationSettings,
    updateNotificationSetting,
} from "../lib/models/notificationSettings";
import { scheduleStreakNotification, scheduleWeeklyDigestNotification } from "../lib/notifications";
import SettingsItem from "./components/SettingsItem";
import { AnimatedToggle } from "./components/AnimatedToggle";

export default function NotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [settings, setSettings] = useState<NotificationSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadSettings();
        }, [])
    );

    const loadSettings = async () => {
        try {
            const data = await getNotificationSettings();
            setSettings(data);
        } catch (error) {
            console.error("Error loading notification settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    const handleToggle = async (
        key: keyof Omit<NotificationSettings, "id" | "user_id" | "updated_at">,
        value: boolean
    ) => {
        // Optimistic update
        setSettings((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                [key]: value,
            };
        });

        // Save to database
        try {
            await updateNotificationSetting(key, value);
            if (key === "streaks") {
                await scheduleStreakNotification();
            }
            if (key === "weekly_summary_digest") {
                await scheduleWeeklyDigestNotification();
            }
        } catch (error) {
            console.error(`Error updating ${key}:`, error);
            // Revert changes on error
            await loadSettings();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.headerTitle}>Notifications</Text>
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
                        Here you can select which notifications you'd like to
                        receive from this app. Please note that some notifications
                        (like the "Weekly Digest") require AI features to use.
                    </Text>

                    <View style={styles.settingsGroup}>
                        <SettingsItem
                            icon="flame-outline"
                            title="Streak Goals"
                            subtitle="Get reminders to maintain your streak"
                            variant="custom"
                        >
                            <AnimatedToggle
                                value={settings?.streaks ?? false}
                                onValueChange={(value) =>
                                    handleToggle("streaks", value)
                                }
                                trackColor={{ false: "#333", true: "#ff5526" }}
                                thumbColor="#ffffff"
                            />
                        </SettingsItem>

                        <View style={styles.separator} />

                        <SettingsItem
                            icon="bulb-outline"
                            title="Motivation (in progress)"
                            subtitle="Receive encouraging messages to keep you going"
                            variant="custom"
                        >
                            <AnimatedToggle
                                value={settings?.motivation ?? false}
                                onValueChange={(value) =>
                                    handleToggle("motivation", value)
                                }
                                trackColor={{ false: "#333", true: "#ff5526" }}
                                thumbColor="#ffffff"
                            />
                        </SettingsItem>

                        <View style={styles.separator} />

                        <SettingsItem
                            icon="mail-unread-outline"
                            title="Weekly Digest (experimental)"
                            subtitle="AI-generated summary of your weekly performance"
                            variant="custom"
                        >
                            <AnimatedToggle
                                value={settings?.weekly_summary_digest ?? false}
                                onValueChange={(value) =>
                                    handleToggle("weekly_summary_digest", value)
                                }
                                trackColor={{ false: "#333", true: "#ff5526" }}
                                thumbColor="#ffffff"
                            />
                        </SettingsItem>
                    </View>

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
    settingsGroup: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        overflow: "hidden",
    },
    separator: {
        height: 1,
        backgroundColor: "#2a2a2a",
        marginLeft: 60,
    },
    bottomPadding: {
        height: 32,
    },
});
