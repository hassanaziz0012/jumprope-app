import React, { useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { useFocusEffect } from "expo-router";
import { getUserProfile, saveUserProfile, type UserProfile } from "../../lib/database";
import AIConsentModal from "../components/AIConsentModal";
import Button from "../components/Button";
import { Ionicons } from "@expo/vector-icons";
import AIChatHeader from "../components/AIChatHeader";
import AIPromptSuggestions from "../components/AIPromptSuggestions";
import AIChatInput from "../components/AIChatInput";
import AIHistorySidebar from "../components/AIHistorySidebar";
import AIChatBubble from "../components/ai/AIChatBubble";
import AIToolCallCard from "../components/ai/AIToolCallCard";
import AIStatusMessage from "../components/ai/AIStatusMessage";
import AIErrorMessage from "../components/ai/AIErrorMessage";
import MessageLimitPill from "../components/ai/MessageLimitPill";
import { useAIChat } from "../hooks/useAIChat";
import { LIMITS } from "../../lib/constants";

export default function AIScreen() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const scrollViewRef = useRef<ScrollView>(null);

    const {
        messages,
        userMessageCount,
        conversationTitle,
        sendMessage: handleSendMessage,
        approveTool: handleApproveTool,
        rejectTool: handleRejectTool,
        selectConversation: handleSelectConversation,
        clearChat: handleNewConversation,
        deleteConversation: handleDeleteConversation
    } = useAIChat();

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

    const handleHistoryPress = () => {
        setIsSidebarOpen(true);
    };

    if (!user?.ai_enabled) {
        return (
            <View style={styles.containerCenter}>
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

    // Main AI Chat Interface
    return (
        <SafeAreaView style={styles.container}>
            <AIChatHeader 
                title={conversationTitle} 
                onHistoryPress={handleHistoryPress} 
                onDeleteConversation={handleDeleteConversation} 
                onNewConversation={handleNewConversation} 
            />

            <MessageLimitPill count={userMessageCount} />
            
            <ScrollView 
                style={styles.chatArea}
                contentContainerStyle={[
                    styles.chatContent,
                    messages.length === 0 && styles.chatContentEmpty
                ]}
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.length === 0 ? (
                    <View style={styles.greetingContainer}>
                        <View style={styles.greetingHeader}>
                            <View style={styles.geminiIcon}>
                                <Ionicons name="sparkles" size={32} color="#ffffff" />
                            </View>
                            <Text style={styles.greetingHello}>Hello, <Text style={styles.greetingName}>{user.name}!</Text></Text>
                            <Text style={styles.greetingQuestion}>How can I assist{"\n"}you today?</Text>
                        </View>
                        
                        <AIPromptSuggestions onSelectOption={handleSendMessage} />
                    </View>
                ) : (
                    <View style={styles.messagesList}>
                        {messages.map((msg, index) => {
                            const isLatest = index === messages.length - 1;
                            
                            if (msg.type === "user_message" || msg.type === "ai_message") {
                                return <AIChatBubble key={msg.id} type={msg.type} text={msg.text} />;
                            } else if (msg.type === "status") {
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
                                        status={msg.status}
                                        onApprove={handleApproveTool}
                                        onReject={handleRejectTool}
                                    />
                                );
                            } else if (msg.type === "error") {
                                return (
                                    <AIErrorMessage key={msg.id} text={msg.text} />
                                );
                            }
                            return null;
                        })}
                    </View>
                )}
            </ScrollView>

            <AIChatInput 
                onSend={handleSendMessage} 
                locked={userMessageCount >= LIMITS.AI_CHAT_MESSAGES}
                onNewConversation={handleNewConversation}
            />
            
            <AIHistorySidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    containerCenter: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
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
    chatArea: {
        flex: 1,
    },
    chatContent: {
        padding: 20,
        paddingBottom: 40,
    },
    chatContentEmpty: {
        flexGrow: 1,
        justifyContent: "center",
    },
    greetingContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    greetingHeader: {
        alignItems: "center",
        marginBottom: 20,
    },
    geminiIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#10a37f", // Greenish gradient look from design
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    greetingHello: {
        fontSize: 22,
        color: "#a0a0a0",
        fontWeight: "400",
        marginBottom: 8,
    },
    greetingName: {
        color: "#ffffff",
        fontWeight: "600",
    },
    greetingQuestion: {
        fontSize: 32,
        fontWeight: "800",
        color: "#ffffff",
        textAlign: "center",
        lineHeight: 38,
    },
    messagesList: {
        gap: 16,
    },
});
