import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    getAllWorkouts,
    getUserProfile,
    type UserProfile,
} from "../../lib/database";
import ProfileCard from "../components/ProfileCard";
import SettingsItem from "../components/SettingsItem";
import { type LifetimeStats } from "../components/ShareableLifetimeCard";
import AIConsentModal from "../components/AIConsentModal";
import AboutModal from "../components/settings/AboutModal";
import ShareLifetimeModal from "../components/settings/ShareLifetimeModal";
import { saveUserProfile } from "../../lib/database";

export default function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<UserProfile | null>(null);

    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [aboutModalVisible, setAboutModalVisible] = useState(false);
    const [aiModalVisible, setAiModalVisible] = useState(false);

    const [stats, setStats] = useState<LifetimeStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [])
    );

    const loadProfile = async () => {
        const profile = await getUserProfile();
        setUser(profile);
    };

    const handleProfilePress = () => {
        router.push("/profile");
    };

    const handleGoalsPress = () => {
        router.push("/goals");
    };

    const handleExportPress = () => {
        router.push("/export");
    };

    const handleSharePress = async () => {
        setShareModalVisible(true);
        setLoadingStats(true);
        try {
            const workouts = await getAllWorkouts();
            if (workouts.length > 0) {
                const totalWorkouts = workouts.length;
                const maxSkips = Math.max(
                    ...workouts.map((w) => w.total_skips)
                );
                const maxAvgSkips = Math.max(
                    ...workouts.map((w) => w.avg_skips_per_minute)
                );
                const maxDuration = Math.max(
                    ...workouts.map((w) => w.duration)
                );

                setStats({
                    totalWorkouts,
                    maxSkips,
                    maxAvgSkips,
                    maxDuration,
                });
            } else {
                setStats({
                    totalWorkouts: 0,
                    maxSkips: 0,
                    maxAvgSkips: 0,
                    maxDuration: 0,
                });
            }
        } catch (error) {
            console.error("Error calculating stats:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleAboutPress = () => {
        setAboutModalVisible(true);
    };

    const handleAIToggle = async (value: boolean) => {
        if (value) {
            setAiModalVisible(true);
        } else {
            if (user) {
                await saveUserProfile(user.name, user.email || undefined, user.image || undefined, false);
                await loadProfile();
            }
        }
    };

    const handleAIConsent = async () => {
        if (user) {
            await saveUserProfile(user.name, user.email || undefined, user.image || undefined, true);
            await loadProfile();
        }
        setAiModalVisible(false);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Text style={styles.title}>Settings</Text>

                {/* Profile Card */}
                <View style={styles.profileSection}>
                    <ProfileCard
                        name={user?.name}
                        email={user?.email}
                        imageUri={user?.image}
                        onPress={handleProfilePress}
                    />
                </View>

                {/* AI Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>AI Tools</Text>
                    <View style={styles.settingsGroup}>
                        <SettingsItem
                            icon="sparkles-outline"
                            title="Turn on AI features"
                            variant="custom"
                        >
                            <Switch
                                value={user?.ai_enabled || false}
                                onValueChange={handleAIToggle}
                                trackColor={{ false: "#333", true: "#ff5526" }}
                                thumbColor="#ffffff"
                            />
                        </SettingsItem>
                        <View style={styles.separator} />
                        <SettingsItem
                            icon="calendar-outline"
                            title="Weekly Digest"
                            onPress={() => router.push("/weekly-digest")}
                        />
                    </View>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.settingsGroup}>
                        <SettingsItem
                            icon="notifications-outline"
                            title="Notifications"
                            onPress={() => router.push("/notifications")}
                        />
                        <View style={styles.separator} />
                        <SettingsItem
                            icon="flag-outline"
                            title="Goals"
                            onPress={handleGoalsPress}
                        />
                        <View style={styles.separator} />
                        <SettingsItem
                            icon="bar-chart-outline"
                            title="Charts"
                            onPress={() => router.push("/charts")}
                        />
                    </View>
                </View>

                {/* More Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>More</Text>
                    <View style={styles.settingsGroup}>
                        <SettingsItem
                            icon="sync-outline"
                            title="Sync"
                            onPress={() => router.push("/sync")}
                        />
                        <View style={styles.separator} />
                        <SettingsItem
                            icon="share-social-outline"
                            title="Share"
                            onPress={handleSharePress}
                        />
                        <View style={styles.separator} />
                        <SettingsItem
                            icon="download-outline"
                            title="Export"
                            onPress={handleExportPress}
                        />
                        <View style={styles.separator} />
                        <SettingsItem
                            icon="information-circle-outline"
                            title="About"
                            onPress={handleAboutPress}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Share Modal */}
            <ShareLifetimeModal
                visible={shareModalVisible}
                onClose={() => setShareModalVisible(false)}
                stats={stats}
                loadingStats={loadingStats}
            />

            {/* About Modal */}
            <AboutModal
                visible={aboutModalVisible}
                onClose={() => setAboutModalVisible(false)}
            />

            {/* AI Consent Modal */}
            <AIConsentModal
                visible={aiModalVisible}
                onCancel={() => setAiModalVisible(false)}
                onConsent={handleAIConsent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 24,
    },
    profileSection: {
        marginBottom: 32,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666666",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 12,
        marginLeft: 4,
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
});
