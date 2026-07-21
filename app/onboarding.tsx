import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { saveUserProfile, setSyncEnabled } from "../lib/database";
import { AnimatedToggle } from "./components/AnimatedToggle";
import Button from "./components/Button";

export default function OnboardingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [aiEnabled, setAiEnabled] = useState(false);
    const [syncEnabled, setSyncEnabledState] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleAiToggle = (value: boolean) => {
        setAiEnabled(value);
        if (value) {
            // Force sync to be enabled if AI is enabled
            setSyncEnabledState(true);
        }
    };

    const handleSyncToggle = (value: boolean) => {
        // Only allow toggling sync off if AI is currently off
        if (!value && aiEnabled) {
            return;
        }
        setSyncEnabledState(value);
    };

    const handleContinue = async () => {
        if (!name.trim()) return;

        setIsSaving(true);
        try {
            await saveUserProfile(
                name.trim(),
                email.trim() || undefined,
                undefined, // image
                aiEnabled
            );
            await setSyncEnabled(syncEnabled);

            // Navigate to main tabs after successful save
            router.replace("/(tabs)" as any);
        } catch (error) {
            console.error("Failed to complete onboarding:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="sparkles" size={32} color="#ccfa53" />
                    </View>
                    <Text style={styles.title}>Welcome to Jumprope</Text>
                    <Text style={styles.subtitle}>
                        {"This is a quick onboarding flow to help setup your profile. Once you're done, you can use the app like a normal user to log and track your workouts!"}
                    </Text>
                </View>

                {/* Form Section */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>About You</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="What should we call you?"
                            placeholderTextColor="#666666"
                            autoCapitalize="words"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email (optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="For backup purposes"
                            placeholderTextColor="#666666"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                </View>

                {/* Features Section */}
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>App Features</Text>

                    <View style={styles.settingCard}>
                        <View style={styles.settingInfo}>
                            <View style={styles.settingTitleRow}>
                                <Ionicons name="cloud-done" size={20} color="#ccfa53" />
                                <Text style={styles.settingTitle}>Cloud Sync</Text>
                            </View>
                            <Text style={styles.settingDescription}>
                                Automatically back up your workout data to access it across devices.
                            </Text>
                        </View>
                        <AnimatedToggle
                            value={syncEnabled}
                            onValueChange={handleSyncToggle}
                            trackColor={{ false: "#2a2a2a", true: "#1a3a1a" }}
                            thumbColor={syncEnabled ? "#ccfa53" : "#666666"}
                        />
                    </View>

                    <View style={styles.settingCard}>
                        <View style={styles.settingInfo}>
                            <View style={styles.settingTitleRow}>
                                <Ionicons name="chatbubbles" size={20} color="#ff5526" />
                                <Text style={styles.settingTitle}>AI Assistant</Text>
                            </View>
                            <Text style={styles.settingDescription}>
                                Get personalized tips, generate workout summaries, and chat with your AI fitness coach.
                                Requires Cloud Sync.
                            </Text>
                        </View>
                        <AnimatedToggle
                            value={aiEnabled}
                            onValueChange={handleAiToggle}
                            trackColor={{ false: "#2a2a2a", true: "#3a1a1a" }}
                            thumbColor={aiEnabled ? "#ff5526" : "#666666"}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Footer with Continue Button */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <Button
                    title={isSaving ? "Setting up..." : "Let's Go"}
                    onPress={handleContinue}
                    disabled={!name.trim() || isSaving}
                    icon={!isSaving ? "arrow-forward" : undefined}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: 40,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#1a1a1a",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#2a2a2a",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 12,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "#a0a0a0",
        textAlign: "center",
        lineHeight: 24,
        paddingHorizontal: 8,
    },
    formSection: {
        marginBottom: 32,
        gap: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 8,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#a0a0a0",
        marginLeft: 4,
    },
    input: {
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#ffffff",
        borderWidth: 1,
        borderColor: "transparent",
    },
    settingCard: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
    },
    settingInfo: {
        flex: 1,
        gap: 4,
    },
    settingTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
    settingDescription: {
        fontSize: 13,
        color: "#a0a0a0",
        lineHeight: 18,
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        backgroundColor: "#0a0a0a",
        borderTopWidth: 1,
        borderTopColor: "#1a1a1a",
    },
});
