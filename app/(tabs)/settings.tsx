import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useRef, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import {
    getAllWorkouts,
    getUserProfile,
    type UserProfile,
} from "../../lib/database";
import { aboutLinks } from "../../lib/social";
import ProfileCard from "../components/ProfileCard";
import SettingsItem from "../components/SettingsItem";
import ShareableLifetimeCard, {
    type LifetimeStats,
} from "../components/ShareableLifetimeCard";
import AIConsentModal from "../components/AIConsentModal";
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
    const cardRef = useRef<View>(null);

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

    const handleShareContent = async () => {
        try {
            const uri = await captureRef(cardRef, {
                format: "png",
                quality: 1,
            });
            await Sharing.shareAsync(uri);
        } catch (error) {
            console.error("Error sharing:", error);
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
                    </View>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.settingsGroup}>
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
            <Modal
                visible={shareModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setShareModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShareModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        {loadingStats ? (
                            <ActivityIndicator
                                size="large"
                                color="#ff5526"
                                style={styles.loader}
                            />
                        ) : stats ? (
                            <View style={styles.shareContainer}>
                                <View
                                    ref={cardRef}
                                    style={styles.cardContainer}
                                    collapsable={false}
                                >
                                    <ShareableLifetimeCard stats={stats} />
                                </View>
                                <Pressable
                                    style={styles.shareButton}
                                    onPress={handleShareContent}
                                >
                                    <Text style={styles.shareButtonText}>
                                        Share
                                    </Text>
                                    <Ionicons
                                        name="share-outline"
                                        size={20}
                                        color="#ffffff"
                                    />
                                </Pressable>
                            </View>
                        ) : (
                            <>
                                <Ionicons
                                    name="share-social"
                                    size={48}
                                    color="#ff5526"
                                />
                                <Text style={styles.modalTitle}>Share</Text>
                                <Text style={styles.modalSubtitle}>
                                    No workouts found to share.
                                </Text>
                            </>
                        )}
                        <Pressable
                            style={styles.modalCloseButton}
                            onPress={() => setShareModalVisible(false)}
                        >
                            <Text style={styles.modalCloseText}>Close</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

            {/* About Modal */}
            <Modal
                visible={aboutModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAboutModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setAboutModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <Ionicons name="fitness" size={48} color="#ccfa53" />
                        <Text style={styles.modalTitle}>Jumprope Tracker</Text>
                        <Text style={styles.modalVersion}>Version 1.0.0</Text>
                        <Text style={styles.modalSubtitle}>
                            Track your jump rope workouts and improve your
                            fitness!
                        </Text>
                        <Text style={styles.modalSubtitle}>
                            I made this for tracking my own jumprope workouts.
                            If this helps you, you can learn more about me and
                            my work from any of the following links.
                        </Text>
                        <View style={styles.socialRow}>
                            {[
                                {
                                    icon: "logo-twitter",
                                    url: aboutLinks.twitter,
                                },
                                {
                                    icon: "logo-youtube",
                                    url: aboutLinks.youtube,
                                },
                                {
                                    icon: "logo-github",
                                    url: aboutLinks.github,
                                },
                                {
                                    icon: "globe-outline",
                                    url: aboutLinks.website,
                                },
                            ].map((item, index) => (
                                <Pressable
                                    key={index}
                                    style={styles.socialButton}
                                    onPress={() => Linking.openURL(item.url)}
                                >
                                    <Ionicons
                                        name={item.icon as any}
                                        size={24}
                                        color="#ccfa53"
                                    />
                                </Pressable>
                            ))}
                        </View>

                        <Pressable
                            style={styles.modalCloseButton}
                            onPress={() => setAboutModalVisible(false)}
                        >
                            <Text style={styles.modalCloseText}>Close</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>

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

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    modalContent: {
        backgroundColor: "#1a1a1a",
        borderRadius: 20,
        padding: 32,
        width: "100%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#ffffff",
        marginTop: 16,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        color: "#a0a0a0",
        textAlign: "center",
        marginBottom: 8,
    },
    modalVersion: {
        fontSize: 14,
        color: "#666666",
        marginBottom: 24,
    },
    modalCloseButton: {
        backgroundColor: "#2a2a2a",
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
    socialRow: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 24,
        marginTop: 16,
    },
    socialButton: {
        backgroundColor: "#2a2a2a",
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    shareContainer: {
        alignItems: "center",
        width: "100%",
    },
    cardContainer: {
        width: "100%",
        marginBottom: 24,
    },
    shareButton: {
        backgroundColor: "#ff5526",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        gap: 8,
        width: "100%",
    },
    shareButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
    },
    loader: {
        marginVertical: 40,
    },
});
