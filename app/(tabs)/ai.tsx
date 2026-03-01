import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { getUserProfile, saveUserProfile, type UserProfile } from "../../lib/database";
import AIConsentModal from "../components/AIConsentModal";
import Button from "../components/Button";
import { Ionicons } from "@expo/vector-icons";
import AIChatHeader from "../components/AIChatHeader";
import AIPromptSuggestions from "../components/AIPromptSuggestions";
import AIChatInput from "../components/AIChatInput";
import AIHistorySidebar from "../components/AIHistorySidebar";
import EventSource from "react-native-sse";
import Animated, { FadeInDown } from "react-native-reanimated";
import Markdown from "react-native-markdown-display";
import { getToolDisplayInfo, formatToolArgs, askAgent } from "../../lib/aiCoach/ask";
import { fetchConversationHistory, deleteConversation } from "../../lib/aiCoach/chats";
import { createWorkout } from "../../lib/models/workout";
import { addRestDay } from "../../lib/models/restDays";
import { updateGoal } from "../../lib/models/goals";

interface Message {
    id: string;
    type: "user_message" | "ai_message" | "status" | "tool_call" | "error";
    text?: string;
    tool?: string;
    args?: Record<string, any>;
    result?: any;
    status?: "pending" | "approved" | "rejected";
    completed?: boolean;
}

export default function AIScreen() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    
    // Chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationTitle, setConversationTitle] = useState("");
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const scrollViewRef = useRef<ScrollView>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Clean up EventSource on unmount
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

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

    const startAgentStream = async (text: string, continueConversation: boolean = false) => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        console.log("Starting agent stream with text:", text);

        const es = await askAgent(text, conversationId, {
            onConversationId: (id, title) => {
                if (title) setConversationTitle(title);
                if (id) setConversationId(id);
            },
            onStatus: (message) => {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now().toString() + Math.random(),
                        type: "status",
                        text: message
                    }
                ]);
            },
            onToolCall: (tool, args) => {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now().toString() + Math.random(),
                        type: "tool_call",
                        tool,
                        args,
                        completed: false
                    }
                ]);
            },
            onToolResult: (tool, result) => {
                const isWriteTool = ["create_workout", "mark_rest_day", "set_goal"].includes(tool);
                setMessages(prev => {
                    const newMessages = [...prev];
                    for (let i = newMessages.length - 1; i >= 0; i--) {
                        if (newMessages[i].type === "tool_call" && newMessages[i].tool === tool && !newMessages[i].completed) {
                            newMessages[i] = { 
                                ...newMessages[i], 
                                completed: true,
                                result,
                                status: isWriteTool ? "pending" : undefined 
                            };
                            break;
                        }
                    }
                    return newMessages;
                });
            },
            onFinalResponse: (text) => {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now().toString() + Math.random(),
                        type: "ai_message",
                        text
                    }
                ]);
                eventSourceRef.current = null;
            },
            onError: (message) => {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now().toString() + Math.random(),
                        type: "error",
                        text: message || "An error occurred."
                    }
                ]);
                eventSourceRef.current = null;
            }
        }, continueConversation);

        eventSourceRef.current = es;
    };

    const handleSendMessage = async (text: string) => {
        // Add message to state
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            type: "user_message"
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // If it's the first message, set the title
        if (messages.length === 0) {
            setConversationTitle("New Conversation"); // Would realistically be generated by AI
        }
        
        await startAgentStream(text, false);
    };

    const handleApproveTool = async (msgId: string) => {
        const msg = messages.find(m => m.id === msgId);
        if (!msg || !msg.tool || !msg.result) return;
        
        try {
            if (msg.tool === "create_workout") {
                await createWorkout({
                    date: msg.result.date,
                    duration: msg.result.duration,
                    totalSkips: msg.result.total_skips,
                    avgSkipsPerMinute: msg.result.avg_skips_per_minute,
                    trips: msg.result.trips,
                    calories: msg.result.calories,
                    heartRateAvg: msg.result.heart_rate_avg,
                    heartRateMax: msg.result.heart_rate_max,
                    notes: msg.result.notes
                });
            } else if (msg.tool === "mark_rest_day") {
                await addRestDay(msg.result.date);
            } else if (msg.tool === "set_goal") {
                await updateGoal(msg.result.updated_goal, msg.result.new_value);
            }

            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: "approved" } : m));
            
            // Continue conversation with agent after tool approval
            await startAgentStream("", true);
        } catch (err) {
            console.error("Failed to apply changes to local database:", err);
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: "rejected" } : m));
        }
    };

    const handleRejectTool = (msgId: string) => {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: "rejected" } : m));
    };

    const handleHistoryPress = () => {
        setIsSidebarOpen(true);
    };

    const handleSelectConversation = async (id: string, title: string) => {
        setConversationId(id);
        setConversationTitle(title);
        // Clear messages while we load the new ones
        setMessages([]);

        try {
            const history = await fetchConversationHistory(id);
            const formattedMessages: Message[] = history.messages.reduce((acc: Message[], msg, index) => {
                if (msg.role === "tool" || msg.role === "function") {
                    return acc;
                }

                if (msg.tool_calls && Array.isArray(msg.tool_calls)) {
                    msg.tool_calls.forEach((tc, tcIndex) => {
                        acc.push({
                            id: `tc-${msg.id || Date.now()}-${index}-${tcIndex}`,
                            type: "tool_call",
                            tool: tc.name,
                            args: tc.args,
                            completed: true
                        });
                    });
                }

                if (msg.content) {
                    acc.push({
                        id: `msg-${msg.id || Date.now()}-${index}`,
                        type: msg.role === "user" ? "user_message" : "ai_message",
                        text: msg.content,
                    });
                }

                return acc;
            }, []);

            setMessages(formattedMessages);
        } catch (error) {
            console.error("Failed to load conversation history:", error);
            setMessages([{
                id: Date.now().toString(),
                type: "error",
                text: "Failed to load conversation history."
            }]);
        }
    };

    const handleNewConversation = () => {
        setMessages([]);
        setConversationTitle("");
        setConversationId(null);
    };

    const handleDeleteConversation = async () => {
        if (conversationId) {
            try {
                await deleteConversation(conversationId);
            } catch (error) {
                console.error("Failed to delete conversation from backend:", error);
            }
        }
        setMessages([]);
        setConversationTitle("");
        setConversationId(null);
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
                                return (
                                    <Animated.View 
                                        key={msg.id} 
                                        entering={FadeInDown.duration(400).springify()}
                                        style={[
                                            styles.messageBubble,
                                            msg.type === "user_message" ? styles.messageUser : styles.messageAI
                                        ]}
                                    >
                                        {msg.type === "ai_message" ? (
                                            <Markdown style={markdownStyles}>
                                                {msg.text || ""}
                                            </Markdown>
                                        ) : (
                                            <Text style={styles.messageText}>{msg.text}</Text>
                                        )}
                                    </Animated.View>
                                );

                            } else if (msg.type === "status") {
                                return (
                                    <Animated.View key={msg.id} entering={FadeInDown.duration(400).springify()} style={styles.statusContainer}>
                                        {isLatest ? (
                                            <ActivityIndicator size="small" color="#ccfa53" style={styles.statusIcon} />
                                        ) : (
                                            <Ionicons name="checkmark-circle" size={14} color="#a0a0a0" style={styles.statusIcon} />
                                        )}
                                        <Text style={styles.statusText}>{msg.text}</Text>
                                    </Animated.View>
                                );
                            } else if (msg.type === "tool_call") {
                                const toolInfo = getToolDisplayInfo(msg.tool || "");
                                const formattedArgsList = formatToolArgs(msg.tool || "", msg.args);

                                return (
                                    <Animated.View key={msg.id} entering={FadeInDown.duration(400).springify()} style={styles.toolCallCard}>
                                        <View style={styles.toolCallHeader}>
                                            <Ionicons name={toolInfo.icon} size={18} color="#ff5526" />
                                            <Text style={styles.toolCallTitle}>{toolInfo.title}</Text>
                                            {msg.completed ? (
                                                msg.status === "pending" ? (
                                                    <View style={styles.pendingBadge}>
                                                        <Text style={styles.pendingBadgeText}>Needs Approval</Text>
                                                    </View>
                                                ) : msg.status === "approved" ? (
                                                    <Ionicons name="checkmark-circle" size={18} color="#ccfa53" style={styles.toolCallStatusIcon} />
                                                ) : msg.status === "rejected" ? (
                                                    <Ionicons name="close-circle" size={18} color="#ff5526" style={styles.toolCallStatusIcon} />
                                                ) : (
                                                    <Ionicons name="checkmark-circle" size={18} color="#ccfa53" style={styles.toolCallStatusIcon} />
                                                )
                                            ) : (
                                                <ActivityIndicator size="small" color="#ccfa53" style={[styles.toolCallStatusIcon, { transform: [{ scale: 0.8 }] }]} />
                                            )}
                                        </View>
                                        {formattedArgsList && formattedArgsList.length > 0 && (
                                            <View style={styles.toolArgsGrid}>
                                                {formattedArgsList.map((arg, i) => (
                                                    <View key={i} style={styles.toolArgPill}>
                                                        <Text style={styles.toolArgLabel}>{arg.label}</Text>
                                                        <Text style={styles.toolArgValue}>{arg.value}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                        {msg.status === "pending" && (
                                            <View style={styles.toolCallActions}>
                                                <Button 
                                                    title="Reject" 
                                                    onPress={() => handleRejectTool(msg.id)}
                                                    variant="secondary"
                                                    style={styles.toolCallButton}
                                                />
                                                <View style={{ width: 8 }} />
                                                <Button 
                                                    title="Approve" 
                                                    onPress={() => handleApproveTool(msg.id)}
                                                    variant="primary"
                                                    style={styles.toolCallButton}
                                                />
                                            </View>
                                        )}
                                    </Animated.View>
                                );
                            } else if (msg.type === "error") {
                                return (
                                    <Animated.View key={msg.id} entering={FadeInDown.duration(400).springify()} style={styles.errorCard}>
                                        <Ionicons name="alert-circle" size={20} color="#ff5526" />
                                        <Text style={styles.errorText}>{msg.text}</Text>
                                    </Animated.View>
                                );
                            }
                            return null;
                        })}
                    </View>
                )}
            </ScrollView>

            <AIChatInput onSend={handleSendMessage} />
            
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
    messageBubble: {
        maxWidth: "85%",
        padding: 14,
        borderRadius: 20,
    },
    messageUser: {
        alignSelf: "flex-end",
        backgroundColor: "#ff5526",
        borderBottomRightRadius: 4,
    },
    messageAI: {
        alignSelf: "flex-start",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderBottomLeftRadius: 4,
    },
    messageText: {
        color: "#ffffff",
        fontSize: 16,
        lineHeight: 22,
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        marginVertical: 4,
    },
    statusIcon: {
        marginRight: 6,
    },
    statusText: {
        color: "#a0a0a0",
        fontSize: 12,
        fontStyle: "italic",
    },
    toolCallCard: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 16,
        marginVertical: 4,
        alignSelf: "flex-start",
        width: "85%",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    toolCallHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    toolCallTitle: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 8,
        flex: 1,
    },
    toolCallStatusIcon: {
        marginLeft: 8,
    },
    pendingBadge: {
        backgroundColor: "rgba(255, 165, 0, 0.2)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    pendingBadgeText: {
        color: "#ffa500",
        fontSize: 10,
        fontWeight: "bold",
    },
    toolCallActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 12,
    },
    toolCallButton: {
        minHeight: 36,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    toolArgsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },
    toolArgPill: {
        backgroundColor: "rgba(0,0,0,0.3)",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.05)",
    },
    toolArgLabel: {
        color: "#888888",
        fontSize: 10,
        textTransform: "uppercase",
        fontWeight: "600",
        marginBottom: 2,
    },
    toolArgValue: {
        color: "#ffffff",
        fontSize: 13,
        fontWeight: "500",
    },
    errorCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 85, 38, 0.15)",
        borderRadius: 16,
        padding: 16,
        marginVertical: 4,
        alignSelf: "center",
        width: "85%",
        borderWidth: 1,
        borderColor: "rgba(255, 85, 38, 0.3)",
    },
    errorText: {
        color: "#ff5526",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 8,
        flex: 1,
    },
});

const markdownStyles = StyleSheet.create({
    body: {
        color: "#ffffff",
        fontSize: 16,
        lineHeight: 22,
    },
    paragraph: {
        marginTop: 0,
        marginBottom: 8,
    },
    code_inline: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        color: "#ccfa53",
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    },
    code_block: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "#ffffff",
        borderRadius: 8,
        padding: 12,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        marginTop: 8,
        marginBottom: 8,
    },
    fence: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "#ffffff",
        borderRadius: 8,
        padding: 12,
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        marginTop: 8,
        marginBottom: 8,
    },
    heading1: { fontSize: 24, fontWeight: 'bold', marginTop: 12, marginBottom: 8, color: '#ffffff' },
    heading2: { fontSize: 22, fontWeight: 'bold', marginTop: 12, marginBottom: 8, color: '#ffffff' },
    heading3: { fontSize: 20, fontWeight: 'bold', marginTop: 12, marginBottom: 8, color: '#ffffff' },
    heading4: { fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 8, color: '#ffffff' },
    heading5: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 8, color: '#ffffff' },
    heading6: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 8, color: '#ffffff' },
    link: { color: "#ccfa53", textDecorationLine: "underline" },
    list_item: { marginBottom: 4 },
    bullet_list: { marginBottom: 8 },
    ordered_list: { marginBottom: 8 },
});
