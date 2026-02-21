import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { getUserProfile, saveUserProfile, type UserProfile } from "../../lib/database";
import AIConsentModal from "../components/AIConsentModal";
import Button from "../components/Button";
import { Ionicons } from "@expo/vector-icons";

export default function AIScreen() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [])
    );

    const loadProfile = async () => {
        const profile = await getUserProfile();
        setUser(profile);
    };

    const handleConsent = async () => {
        if (user) {
            await saveUserProfile(user.name, user.email || undefined, user.image || undefined, true);
            await loadProfile();
        }
        setModalVisible(false);
    };

    if (!user?.ai_enabled) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyStateContainer}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="sparkles" size={48} color="#ccfa53" />
                    </View>
                    <Text style={styles.emptyStateTitle}>AI Coach</Text>
                    <Text style={styles.emptyStateSubtitle}>
                        Your personal jump rope coach, powered by Gemini. Get 
                        personalized workout insights and goals.
                    </Text>
                    <Button 
                        title="Enable AI Features" 
                        onPress={() => setModalVisible(true)} 
                        variant="primary"
                    />
                </View>

                <AIConsentModal
                    visible={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    onConsent={handleConsent}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyStateContainer: {
        alignItems: "center",
        maxWidth: 320,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(204, 250, 83, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    emptyStateTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 16,
        textAlign: "center",
    },
    emptyStateSubtitle: {
        fontSize: 16,
        color: "#a0a0a0",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 24,
    },
});
