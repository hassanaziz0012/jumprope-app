import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeOut } from "react-native-reanimated";
import Button from "./components/Button";
import AIToolCallCard from "./components/ai/AIToolCallCard";
import AIStatusMessage from "./components/ai/AIStatusMessage";
import AIErrorMessage from "./components/ai/AIErrorMessage";
import WeeklyDigestHeader from "./components/weekly-digests/WeeklyDigestHeader";
import WeeklyDigestHistorySidebar from "./components/weekly-digests/WeeklyDigestHistorySidebar";
import { useWeeklyDigest } from "./hooks/useWeeklyDigest";

export default function WeeklyDigestScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const { messages, isGenerating, finalMessage, generateDigest, reset } = useWeeklyDigest();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const hasStarted = messages.length > 0 || isGenerating;

    // Navigate to digest display page when generation completes
    useEffect(() => {
        if (finalMessage) {
            reset();
            router.push({
                pathname: "/digest-display",
                params: { digest: finalMessage, date: new Date().toISOString() },
            });
        }
    }, [finalMessage]);

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <Stack.Screen 
                options={{
                    headerShown: false,
                }} 
            />
            
            <WeeklyDigestHeader onHistoryPress={() => setIsSidebarOpen(true)} />

            {!hasStarted ? (
                <View style={styles.emptyState}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="sparkles" size={48} color="#ccfa53" />
                    </View>
                    <Text style={styles.emptyStateTitle}>Your Weekly Summary</Text>
                    <Text style={styles.emptyStateSubtitle}>
                        Generate a personalized digest of your jump rope activity, 
                        progress, and insights from the past week.
                    </Text>
                    <Button
                        title="Generate Digest"
                        onPress={generateDigest}
                        variant="primary"
                        icon="sparkles-outline"
                    />
                </View>
            ) : (
                <ScrollView
                    style={styles.chatArea}
                    contentContainerStyle={styles.chatContent}
                    ref={scrollViewRef}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    <Animated.View 
                        exiting={FadeOut.duration(400)}
                        style={styles.messagesList}
                    >
                        {messages.map((msg, index) => {
                            const isLatest = index === messages.length - 1;

                            if (msg.type === "status") {
                                return (
                                    <AIStatusMessage key={msg.id} text={msg.text} isLatest={isLatest} />
                                );
                            } else if (msg.type === "tool_call") {
                                return (
                                    <AIToolCallCard
                                        key={msg.id}
                                        id={msg.id}
                                        tool={msg.tool}
                                        args={msg.args}
                                        completed={msg.completed}
                                    />
                                );
                            } else if (msg.type === "error") {
                                return (
                                    <AIErrorMessage key={msg.id} text={msg.text} />
                                );
                            }
                            return null;
                        })}
                    </Animated.View>
                </ScrollView>
            )}

            <WeeklyDigestHistorySidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        paddingHorizontal: 20,
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
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
        fontSize: 22,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 12,
        textAlign: "center",
    },
    emptyStateSubtitle: {
        fontSize: 16,
        color: "#a0a0a0",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 24,
        maxWidth: 320,
    },
    chatArea: {
        flex: 1,
    },
    chatContent: {
        paddingBottom: 40,
    },
    messagesList: {
        gap: 16,
    },
});
