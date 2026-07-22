import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { saveAuthUserProfile } from "../lib/database";
import { apiClient } from "../lib/apiClient";
import { AnimatedToggle } from "./components/AnimatedToggle";
import Button from "./components/Button";

export default function OnboardingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [isSignUp, setIsSignUp] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [aiEnabled, setAiEnabled] = useState(false);
    const [syncEnabled, setSyncEnabledState] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleAiToggle = (value: boolean) => {
        setAiEnabled(value);
        if (value) {
            setSyncEnabledState(true);
        }
    };

    const handleSyncToggle = (value: boolean) => {
        if (!value && aiEnabled) {
            return;
        }
        setSyncEnabledState(value);
    };

    const handleContinue = async () => {
        setErrorMsg(null);

        if (isSignUp) {
            if (!name.trim()) {
                setErrorMsg("Please enter your name.");
                return;
            }
            if (!email.trim()) {
                setErrorMsg("Please enter your email address.");
                return;
            }
            if (!password || password.length < 8) {
                setErrorMsg("Password must be at least 8 characters long.");
                return;
            }
        } else {
            if (!email.trim()) {
                setErrorMsg("Please enter your email address.");
                return;
            }
            if (!password) {
                setErrorMsg("Please enter your password.");
                return;
            }
        }

        setIsSaving(true);
        try {
            if (isSignUp) {
                const res = await apiClient<{
                    status: string;
                    sync_token: string;
                    name: string;
                    email: string;
                    ai_enabled: boolean;
                }>("/auth/signup", {
                    body: {
                        name: name.trim(),
                        email: email.trim(),
                        password: password,
                        ai_enabled: aiEnabled,
                    },
                    suppressToast: true,
                    throwOnError: true,
                });

                await saveAuthUserProfile({
                    name: res.name,
                    email: res.email,
                    syncToken: res.sync_token,
                    aiEnabled: res.ai_enabled,
                    syncEnabled: syncEnabled,
                });
            } else {
                const res = await apiClient<{
                    status: string;
                    sync_token: string;
                    name: string;
                    email: string;
                    ai_enabled: boolean;
                }>("/auth/signin", {
                    body: {
                        email: email.trim(),
                        password: password,
                    },
                    suppressToast: true,
                    throwOnError: true,
                });

                await saveAuthUserProfile({
                    name: res.name || "User",
                    email: res.email,
                    syncToken: res.sync_token,
                    aiEnabled: res.ai_enabled,
                    syncEnabled: true,
                });
            }

            // Navigate to main tabs after successful save/auth
            router.replace("/(tabs)" as any);
        } catch (err: any) {
            console.error("Authentication error:", err);
            const detail = err.data?.detail || err.message || "Failed to authenticate. Please check your details and try again.";
            setErrorMsg(detail);
        } finally {
            setIsSaving(false);
        }
    };

    const isButtonDisabled = isSignUp
        ? !name.trim() || !email.trim() || password.length < 8 || isSaving
        : !email.trim() || !password || isSaving;

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
                    <Text style={styles.title}>
                        {isSignUp ? "Welcome" : "Welcome Back"}
                    </Text>
                </View>

                {/* Auth Mode Toggle */}
                <View style={styles.modeToggleContainer}>
                    <Pressable
                        style={[styles.modeTab, isSignUp && styles.modeTabActive]}
                        onPress={() => {
                            setIsSignUp(true);
                            setErrorMsg(null);
                        }}
                    >
                        <Text style={[styles.modeTabText, isSignUp && styles.modeTabTextActive]}>
                            Create Account
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.modeTab, !isSignUp && styles.modeTabActive]}
                        onPress={() => {
                            setIsSignUp(false);
                            setErrorMsg(null);
                        }}
                    >
                        <Text style={[styles.modeTabText, !isSignUp && styles.modeTabTextActive]}>
                            Sign In
                        </Text>
                    </Pressable>
                </View>

                {/* Error Banner */}
                {errorMsg ? (
                    <View style={styles.errorBanner}>
                        <Ionicons name="alert-circle" size={20} color="#ff4d4d" />
                        <Text style={styles.errorBannerText}>{errorMsg}</Text>
                    </View>
                ) : null}

                {/* Form Section */}
                <View style={styles.formSection}>
                    {isSignUp && (
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
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="your@email.com"
                            placeholderTextColor="#666666"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password *</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                value={password}
                                onChangeText={setPassword}
                                placeholder={isSignUp ? "At least 8 characters" : "Enter your password"}
                                placeholderTextColor="#666666"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <Pressable
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIconContainer}
                                hitSlop={8}
                            >
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color="#a0a0a0"
                                />
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Features Section (Only on Sign Up) */}
                {isSignUp && (
                    <View style={styles.formSection}>
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
                )}
            </ScrollView>

            {/* Footer with Continue Button */}
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <Button
                    title={
                        isSaving
                            ? isSignUp
                                ? "Creating Account..."
                                : "Signing In..."
                            : isSignUp
                            ? "Create Account"
                            : "Sign In"
                    }
                    onPress={handleContinue}
                    disabled={isButtonDisabled}
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
        marginBottom: 24,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#1a1a1a",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#2a2a2a",
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#ffffff",
        textAlign: "center",
    },
    modeToggleContainer: {
        flexDirection: "row",
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#2a2a2a",
    },
    modeTab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
    },
    modeTabActive: {
        backgroundColor: "#2a2a2a",
    },
    modeTabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#888888",
    },
    modeTabTextActive: {
        color: "#ccfa53",
    },
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a1515",
        borderWidth: 1,
        borderColor: "#5a2020",
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        gap: 10,
    },
    errorBannerText: {
        flex: 1,
        fontSize: 14,
        color: "#ff8080",
    },
    formSection: {
        marginBottom: 28,
        gap: 16,
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
        borderColor: "#2a2a2a",
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#2a2a2a",
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#ffffff",
    },
    eyeIconContainer: {
        paddingHorizontal: 14,
        paddingVertical: 14,
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
