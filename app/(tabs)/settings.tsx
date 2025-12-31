import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    Linking,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    getUserProfile,
    updateUserTheme,
    type UserProfile,
} from "../../lib/database";
import { aboutLinks } from "../../lib/social";
import ProfileCard from "../components/ProfileCard";
import SettingsItem from "../components/SettingsItem";

type ThemeOption = "light" | "dark" | "system";

export default function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [theme, setTheme] = useState<ThemeOption>("system");
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [aboutModalVisible, setAboutModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [])
    );

    const loadProfile = async () => {
        const profile = await getUserProfile();
        setUser(profile);
        if (profile?.theme) {
            setTheme(profile.theme as ThemeOption);
        }
    };

    const handleThemeChange = async (newTheme: ThemeOption) => {
        setTheme(newTheme);
        await updateUserTheme(newTheme);
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

    const handleSharePress = () => {
        setShareModalVisible(true);
    };

    const handleAboutPress = () => {
        setAboutModalVisible(true);
    };

    const themeDisplayValue = theme.charAt(0).toUpperCase() + theme.slice(1);

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
                        <View style={styles.separator} />
                        <SettingsItem
                            icon="color-palette-outline"
                            title="Theme"
                            variant="custom"
                        >
                            <View style={styles.themeSelector}>
                                {(
                                    ["light", "dark", "system"] as ThemeOption[]
                                ).map((option) => (
                                    <Pressable
                                        key={option}
                                        style={[
                                            styles.themeOption,
                                            theme === option &&
                                                styles.themeOptionActive,
                                        ]}
                                        onPress={() =>
                                            handleThemeChange(option)
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.themeOptionText,
                                                theme === option &&
                                                    styles.themeOptionTextActive,
                                            ]}
                                        >
                                            {option.charAt(0).toUpperCase() +
                                                option.slice(1)}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </SettingsItem>
                    </View>
                </View>

                {/* More Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>More</Text>
                    <View style={styles.settingsGroup}>
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
                        <Ionicons
                            name="share-social"
                            size={48}
                            color="#ff5526"
                        />
                        <Text style={styles.modalTitle}>Share</Text>
                        <Text style={styles.modalSubtitle}>
                            Share options coming soon!
                        </Text>
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
    themeSelector: {
        flexDirection: "row",
        backgroundColor: "#2a2a2a",
        borderRadius: 8,
        padding: 2,
    },
    themeOption: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    themeOptionActive: {
        backgroundColor: "#ff5526",
    },
    themeOptionText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#a0a0a0",
    },
    themeOptionTextActive: {
        color: "#ffffff",
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
});
