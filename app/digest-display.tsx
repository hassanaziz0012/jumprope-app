import React from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MarkdownDisplay from "./components/MarkdownDisplay";

export default function DigestDisplayScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { digest, date } = useLocalSearchParams<{ digest: string; date: string }>();

    const formattedDate = date
        ? new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
          })
        : "";

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <Stack.Screen 
                options={{
                    headerShown: false,
                }} 
            />
            
            <View style={styles.header}>
                <Pressable 
                    style={({ pressed }) => [
                        styles.backButton,
                        pressed && styles.backButtonPressed,
                    ]}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.title}>Weekly Digest</Text>
                    {formattedDate ? (
                        <Text style={styles.subtitle}>{formattedDate}</Text>
                    ) : null}
                </View>
            </View>

            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
            >
                {digest ? (
                    <MarkdownDisplay>{digest}</MarkdownDisplay>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={48} color="#333" />
                        <Text style={styles.emptyText}>No digest content available.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
        gap: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#1a1a1a",
        justifyContent: "center",
        alignItems: "center",
    },
    backButtonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#ffffff",
    },
    subtitle: {
        fontSize: 13,
        color: "#a0a0a0",
        marginTop: 2,
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 100,
        opacity: 0.6,
    },
    emptyText: {
        marginTop: 16,
        color: "#a0a0a0",
        fontSize: 14,
        textAlign: "center",
    },
});
