import { Ionicons } from "@expo/vector-icons";
import { useRouter, useNavigation } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getUserProfile, saveUserProfile, type AIProvider } from "../lib/database";
import { syncUserProfile } from "../lib/sync";
import { apiClient } from "../lib/apiClient";
import Button from "./components/Button";

const PROVIDERS = [
    { id: "Claude", name: "Claude", subtitle: "Anthropic", icon: "chatbox-ellipses-outline" },
    { id: "ChatGPT", name: "ChatGPT", subtitle: "OpenAI", icon: "aperture-outline" },
    { id: "Gemini", name: "Gemini", subtitle: "Google Spark", icon: "sparkles-outline" },
    { id: "Grok", name: "Grok", subtitle: "xAI", icon: "terminal-outline" },
    { id: "Groq", name: "Groq", subtitle: "Groq Cloud", icon: "flash-outline" },
];

export default function ModelsAndApiKeysScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
    const [apiKey, setApiKey] = useState("");
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [isModelsLoading, setIsModelsLoading] = useState(false);
    const [modelsError, setModelsError] = useState<string | null>(null);

    const isInitialMount = useRef(true);

    // Warning modals state
    const [showIncompleteModal, setShowIncompleteModal] = useState(false);
    const [showLeaveWarningModal, setShowLeaveWarningModal] = useState(false);
    
    // Save reference to the navigation action to perform after leave confirmation
    const [leaveAction, setLeaveAction] = useState<any>(null);

    const hasSavedRef = useRef(false);
    const initialProviderRef = useRef<AIProvider | null>(null);
    const initialApiKeyRef = useRef("");

    const loadModels = async (provider: AIProvider) => {
        setIsModelsLoading(true);
        setModelsError(null);
        try {
            const data = await apiClient("/models/available");
            const key = provider.toLowerCase();
            const models = data[key] || [];
            setAvailableModels(models);
        } catch (error: any) {
            console.error("Error fetching available models:", error);
            setAvailableModels([]);
            setModelsError("Failed to fetch latest models. Please check your network and API server.");
        } finally {
            setIsModelsLoading(false);
        }
    };

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const profile = await getUserProfile();
                if (profile) {
                    if (profile.ai_provider && profile.api_key) {
                        setSelectedProvider(profile.ai_provider);
                        setApiKey(profile.api_key);
                        setSelectedModel(profile.ai_model);
                        initialProviderRef.current = profile.ai_provider;
                        initialApiKeyRef.current = profile.api_key;
                    }
                }
            } catch (error) {
                console.error("Error loading model settings:", error);
            } finally {
                setIsLoading(false);
                setTimeout(() => {
                    isInitialMount.current = false;
                }, 100);
            }
        };
        loadSettings();
    }, []);

    useEffect(() => {
        if (selectedProvider) {
            loadModels(selectedProvider);
            if (!isInitialMount.current) {
                setSelectedModel(null);
            }
        } else {
            setAvailableModels([]);
            if (!isInitialMount.current) {
                setSelectedModel(null);
            }
        }
    }, [selectedProvider]);

    // Intercept back navigation when both options are unfilled
    useEffect(() => {
        const unsubscribe = navigation.addListener("beforeRemove", (e) => {
            if (hasSavedRef.current) {
                return;
            }

            const currentProvider = selectedProvider;
            const currentKey = apiKey.trim();

            // Warn if both options are unfilled (meaning no provider and no key)
            if (!currentProvider && !currentKey) {
                e.preventDefault();
                setLeaveAction(e.data.action);
                setShowLeaveWarningModal(true);
                return;
            }
        });

        return unsubscribe;
    }, [navigation, selectedProvider, apiKey]);

    const handleSave = async () => {
        // Validation: Do not save any changes unless provider, api key, and model are set correctly.
        // Show warning modal if user tries to save while only some are set, or if all are empty.
        const providerSet = !!selectedProvider;
        const keySet = !!apiKey.trim();
        const modelSet = !!selectedModel;

        if (!providerSet || !keySet || !modelSet) {
            setShowIncompleteModal(true);
            return;
        }

        setIsSaving(true);
        try {
            const profile = await getUserProfile();
            if (profile) {
                // Save settings to local profile DB
                await saveUserProfile(
                    profile.name,
                    profile.email || undefined,
                    profile.image || undefined,
                    profile.ai_enabled,
                    selectedProvider,
                    apiKey.trim(),
                    selectedModel
                );

                // Trigger synchronization with backend
                await syncUserProfile();

                hasSavedRef.current = true;
                router.back();
            }
        } catch (error) {
            console.error("Error saving AI model settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmLeave = () => {
        setShowLeaveWarningModal(false);
        hasSavedRef.current = true; // bypass interceptor
        if (leaveAction) {
            navigation.dispatch(leaveAction);
        } else {
            router.back();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.headerTitle}>Models and API Keys</Text>
                <View style={styles.headerSpacer} />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ff5526" />
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.experimentalBanner}>
                        <Ionicons name="alert-circle-outline" size={20} color="#ff5526" />
                        <Text style={styles.experimentalText}>
                            AI features are highly experimental. If you encounter any issues, please let me know so I can fix them.
                        </Text>
                    </View>

                    <Text style={styles.sectionDescription}>
                        Choose an AI model provider and provide your API key. These keys enable custom AI intelligence features locally and sync to your account.
                    </Text>

                    <Text style={styles.sectionTitle}>Select Provider</Text>
                    <View style={styles.grid}>
                        {PROVIDERS.map((provider, index) => {
                            const isSelected = selectedProvider === provider.id;
                            const isLastSingle = index === PROVIDERS.length - 1 && PROVIDERS.length % 2 !== 0;

                            return (
                                <Pressable
                                    key={provider.id}
                                    style={[
                                        styles.card,
                                        isLastSingle && { width: "100%" },
                                        isSelected && styles.cardSelected,
                                    ]}
                                    onPress={() => setSelectedProvider(provider.id as AIProvider)}
                                >
                                    <View
                                        style={[
                                            styles.cardIconContainer,
                                            isSelected && styles.cardIconContainerSelected,
                                        ]}
                                    >
                                        <Ionicons
                                            name={provider.icon as any}
                                            size={22}
                                            color={isSelected ? "#ff5526" : "#a0a0a0"}
                                        />
                                    </View>
                                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                                        {provider.name}
                                    </Text>
                                    <Text style={styles.cardSubtitle}>{provider.subtitle}</Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {selectedProvider && (
                        <>
                            <View style={styles.inputSection}>
                                <Text style={styles.label}>API Key for {selectedProvider}</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={apiKey}
                                        onChangeText={setApiKey}
                                        placeholder={`Enter your ${selectedProvider} API key`}
                                        placeholderTextColor="#666666"
                                        secureTextEntry={secureTextEntry}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    <Pressable
                                        onPress={() => setSecureTextEntry(!secureTextEntry)}
                                        style={styles.eyeButton}
                                    >
                                        <Ionicons
                                            name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
                                            size={20}
                                            color="#a0a0a0"
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            <View style={styles.modelSection}>
                                <Text style={styles.label}>Select Model</Text>
                                {isModelsLoading ? (
                                    <View style={styles.modelLoadingContainer}>
                                        <ActivityIndicator size="small" color="#ff5526" />
                                        <Text style={styles.loadingText}>Fetching available models...</Text>
                                    </View>
                                ) : modelsError ? (
                                    <View style={styles.modelErrorContainer}>
                                        <Ionicons name="alert-circle-outline" size={20} color="#ff5526" />
                                        <Text style={styles.errorText}>{modelsError}</Text>
                                        <Pressable style={styles.retryButton} onPress={() => loadModels(selectedProvider)}>
                                            <Text style={styles.retryButtonText}>Retry</Text>
                                        </Pressable>
                                    </View>
                                ) : availableModels.length === 0 ? (
                                    <Text style={styles.noModelsText}>No models available for this provider.</Text>
                                ) : (
                                    <View style={styles.modelList}>
                                        {availableModels.map((model) => {
                                            const isSelected = selectedModel === model;
                                            return (
                                                <Pressable
                                                    key={model}
                                                    style={[
                                                        styles.modelRow,
                                                        isSelected && styles.modelRowSelected,
                                                    ]}
                                                    onPress={() => setSelectedModel(model)}
                                                >
                                                    <Text style={[styles.modelText, isSelected && styles.modelTextSelected]}>
                                                        {model}
                                                    </Text>
                                                    <Ionicons
                                                        name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                                                        size={20}
                                                        color={isSelected ? "#ff5526" : "#666666"}
                                                    />
                                                </Pressable>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    <View style={styles.bottomPadding} />
                </ScrollView>
            )}

            {/* Footer Save Button */}
            {!isLoading && (
                <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                    <Button
                        title={isSaving ? "Saving..." : "Save Changes"}
                        onPress={handleSave}
                        disabled={isSaving}
                    />
                </View>
            )}

            {/* Incomplete Warning Modal */}
            <Modal
                transparent={true}
                visible={showIncompleteModal}
                animationType="fade"
                onRequestClose={() => setShowIncompleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Incomplete Setup</Text>
                        <Text style={styles.modalText}>
                            Please select a model provider, enter a valid API key, and select a model to save your settings. All fields must be filled.
                        </Text>
                        <View style={styles.modalButtonGroup}>
                            <Pressable
                                style={[styles.modalButton, styles.modalConfirmButton]}
                                onPress={() => setShowIncompleteModal(false)}
                            >
                                <Text style={styles.modalConfirmText}>OK</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Leave Warning Modal */}
            <Modal
                transparent={true}
                visible={showLeaveWarningModal}
                animationType="fade"
                onRequestClose={() => setShowLeaveWarningModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Leave without Setup?</Text>
                        <Text style={styles.modalText}>
                            You are leaving without configuring your AI model and API key. Custom AI features will not be functional. Are you sure you want to leave?
                        </Text>
                        <View style={styles.modalButtonGroup}>
                            <Pressable
                                style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={() => setShowLeaveWarningModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Stay</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.modalButton, styles.modalConfirmButton, { borderColor: "#ff5526" }]}
                                onPress={confirmLeave}
                            >
                                <Text style={[styles.modalConfirmText, { color: "#ff5526" }]}>Leave</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    experimentalBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 85, 38, 0.08)",
        borderWidth: 1,
        borderColor: "rgba(255, 85, 38, 0.3)",
        borderRadius: 12,
        padding: 12,
        gap: 10,
        marginBottom: 20,
    },
    experimentalText: {
        fontSize: 13,
        color: "#ffffff",
        flex: 1,
        lineHeight: 18,
    },
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
        paddingHorizontal: 20,
    },
    sectionDescription: {
        fontSize: 14,
        color: "#a0a0a0",
        marginBottom: 24,
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666666",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 16,
        marginLeft: 4,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    card: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 16,
        width: "48%",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "transparent",
    },
    cardSelected: {
        borderColor: "#ff5526",
        backgroundColor: "rgba(255, 85, 38, 0.05)",
    },
    cardIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: "#2a2a2a",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    cardIconContainerSelected: {
        backgroundColor: "rgba(255, 85, 38, 0.15)",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 4,
    },
    cardTitleSelected: {
        color: "#ff5526",
    },
    cardSubtitle: {
        fontSize: 12,
        color: "#666666",
    },
    inputSection: {
        marginBottom: 24,
        gap: 8,
    },
    modelSection: {
        marginBottom: 24,
        gap: 8,
    },
    modelLoadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#a0a0a0",
    },
    modelErrorContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 85, 38, 0.05)",
        borderColor: "rgba(255, 85, 38, 0.3)",
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        gap: 8,
        flexWrap: "wrap",
    },
    errorText: {
        fontSize: 12,
        color: "#ff5526",
        flex: 1,
    },
    retryButton: {
        backgroundColor: "#ff5526",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    retryButtonText: {
        color: "#ffffff",
        fontSize: 12,
        fontWeight: "600",
    },
    noModelsText: {
        fontSize: 14,
        color: "#666666",
        fontStyle: "italic",
        marginLeft: 4,
    },
    modelList: {
        gap: 8,
    },
    modelRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: "transparent",
    },
    modelRowSelected: {
        borderColor: "#ff5526",
        backgroundColor: "rgba(255, 85, 38, 0.05)",
    },
    modelText: {
        fontSize: 15,
        color: "#a0a0a0",
        fontWeight: "500",
    },
    modelTextSelected: {
        color: "#ffffff",
        fontWeight: "600",
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#a0a0a0",
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: "#ffffff",
    },
    eyeButton: {
        padding: 8,
    },
    bottomPadding: {
        height: 40,
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#1a1a1a",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalCard: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 12,
    },
    modalText: {
        fontSize: 16,
        color: "#a0a0a0",
        lineHeight: 24,
        marginBottom: 24,
    },
    modalButtonGroup: {
        flexDirection: "row",
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    modalCancelButton: {
        backgroundColor: "#2a2a2a",
    },
    modalConfirmButton: {
        backgroundColor: "rgba(255, 85, 38, 0.1)",
        borderWidth: 1,
        borderColor: "#ff5526",
    },
    modalCancelText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    modalConfirmText: {
        color: "#ff5526",
        fontSize: 16,
        fontWeight: "600",
    },
});
