import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getUserProfile } from "../../lib/database";
import { apiClient } from "../../lib/apiClient";

interface Conversation {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

interface GroupedConversations {
    title: string;
    data: Conversation[];
}

interface AIHistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectConversation: (id: string, title: string) => void;
    onNewConversation?: () => void;
}

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(width * 0.8, 320);

export default function AIHistorySidebar({ isOpen, onClose, onSelectConversation, onNewConversation }: AIHistorySidebarProps) {
    const [slideAnim] = useState(new Animated.Value(-SIDEBAR_WIDTH));
    const [loading, setLoading] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [groupedConversations, setGroupedConversations] = useState<GroupedConversations[]>([]);

    useEffect(() => {
        if (isOpen) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
            fetchConversations();
        } else {
            Animated.timing(slideAnim, {
                toValue: -SIDEBAR_WIDTH,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isOpen]);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const profile = await getUserProfile();
            if (!profile?.sync_token) {
                console.error("No sync token found for user");
                setLoading(false);
                return;
            }

            const data: Conversation[] = await apiClient<Conversation[]>(
                `/conversations?sync_token=${profile.sync_token}`
            );
            setConversations(data);
            groupConversations(data);
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    const groupConversations = (conversationsList: Conversation[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);

        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);

        const groups = {
            "Today": [] as Conversation[],
            "Yesterday": [] as Conversation[],
            "Previous 7 Days": [] as Conversation[],
            "Last 30 Days": [] as Conversation[],
            "Older": [] as Conversation[]
        };

        conversationsList.forEach(conv => {
            const updatedDate = new Date(conv.updated_at);

            if (updatedDate >= today) {
                groups["Today"].push(conv);
            } else if (updatedDate >= yesterday) {
                groups["Yesterday"].push(conv);
            } else if (updatedDate >= last7Days) {
                groups["Previous 7 Days"].push(conv);
            } else if (updatedDate >= last30Days) {
                groups["Last 30 Days"].push(conv);
            } else {
                groups["Older"].push(conv);
            }
        });

        // Convert to array and filter out empty groups
        const groupedArray = Object.keys(groups)
            .map(key => ({
                title: key,
                data: groups[key as keyof typeof groups].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            }))
            .filter(group => group.data.length > 0);

        setGroupedConversations(groupedArray);
    };

    const handleSelect = (conv: Conversation) => {
        console.log(`Clicked conversation: ${conv.title} (ID: ${conv.id})`);
        onSelectConversation(conv.id, conv.title);
        onClose();
    };


    // @ts-ignore - internal animated value access for performance optimization
    if (!isOpen && (slideAnim as any)._value === -SIDEBAR_WIDTH) { // Optimization to entirely unmount if fully closed
        return null;
    }

    return (
        <View style={[StyleSheet.absoluteFill, styles.overlayWrapper]} pointerEvents={isOpen ? "auto" : "none"}>
            {/* Backdrop */}
            {isOpen && (
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
            )}

            {/* Sidebar */}
            <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>History</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#a0a0a0" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ff5526" />
                        <Text style={styles.loadingText}>Loading history...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                        <TouchableOpacity
                            style={styles.newConversationItem}
                            onPress={() => {
                                onClose();
                                onNewConversation?.();
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add-circle-outline" size={18} color="#ccfa53" style={styles.convIcon} />
                            <Text style={styles.newConversationText}>New Conversation</Text>
                        </TouchableOpacity>

                        {groupedConversations.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="chatbubbles-outline" size={48} color="#333" />
                                <Text style={styles.emptyText}>No past conversations found.</Text>
                            </View>
                        ) : (
                            groupedConversations.map((group) => (
                                <View key={group.title} style={styles.groupContainer}>
                                    <Text style={styles.groupTitle}>{group.title}</Text>
                                    {group.data.map((conv) => (
                                        <TouchableOpacity
                                            key={conv.id}
                                            style={styles.conversationItem}
                                            onPress={() => handleSelect(conv)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="chatbox-outline" size={18} color="#a0a0a0" style={styles.convIcon} />
                                            <Text style={styles.conversationTitle} numberOfLines={1}>
                                                {conv.title || "New Conversation"}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ))
                        )}
                    </ScrollView>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlayWrapper: {
        zIndex: 100, // Make sure it sits above the chat UI
        elevation: 10,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    sidebar: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: SIDEBAR_WIDTH,
        backgroundColor: "#1a1a1a", // Deep gray card background from styleguide
        borderRightWidth: 1,
        borderRightColor: "rgba(255, 255, 255, 0.05)",
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 60, // Account for safe area
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.05)",
    },
    headerTitle: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
    },
    closeButton: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        color: "#a0a0a0",
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        marginTop: 100,
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.6,
    },
    emptyText: {
        marginTop: 16,
        color: "#a0a0a0",
        fontSize: 14,
        textAlign: "center",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    groupContainer: {
        marginBottom: 24,
    },
    groupTitle: {
        color: "#ff5526", // Primary Orange for group titles
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 12,
        marginLeft: 8,
    },
    newConversationItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "rgba(204, 250, 83, 0.1)", // Light tint of primary color
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "rgba(204, 250, 83, 0.2)",
    },
    newConversationText: {
        color: "#ccfa53",
        fontSize: 15,
        fontWeight: "600",
        flex: 1,
    },
    conversationItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.02)",
        marginBottom: 8,
    },
    convIcon: {
        marginRight: 12,
    },
    conversationTitle: {
        color: "#ffffff",
        fontSize: 15,
        flex: 1,
    },
});
