import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AIChatHeaderProps {
    title: string;
    onHistoryPress: () => void;
    onMenuPress?: () => void;
    onDeleteConversation?: () => void;
    onNewConversation?: () => void;
}

export default function AIChatHeader({
    title,
    onHistoryPress,
    onMenuPress,
    onDeleteConversation,
    onNewConversation,
}: AIChatHeaderProps) {
    const [menuVisible, setMenuVisible] = useState(false);

    return (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.iconButton}
                onPress={onHistoryPress}
                activeOpacity={0.7}
            >
                <Ionicons name="reorder-two-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
                {title ? (
                    <Text style={styles.titleText}>{title}</Text>
                ) : (
                    <Text style={styles.defaultTitle}>AI Chat</Text>
                )}
            </View>
            
            <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                    if (onMenuPress) onMenuPress();
                    setMenuVisible(true);
                }}
                activeOpacity={0.7}
            >
                <Ionicons name="ellipsis-horizontal" size={24} color="#ffffff" />
            </TouchableOpacity>

            <Modal
                visible={menuVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetTitle}>Chat Options</Text>
                        
                        <TouchableOpacity 
                            style={styles.sheetOption}
                            onPress={() => {
                                setMenuVisible(false);
                                onNewConversation?.();
                            }}
                        >
                            <Ionicons name="add-circle-outline" size={24} color="#ffffff" />
                            <Text style={styles.sheetOptionText}>New Conversation</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.sheetOption}
                            onPress={() => {
                                setMenuVisible(false);
                                onDeleteConversation?.();
                            }}
                        >
                            <Ionicons name="trash-outline" size={24} color="#ff5526" />
                            <Text style={styles.sheetOptionTextDanger}>Delete Conversation</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.sheetCancelButton}
                            onPress={() => setMenuVisible(false)}
                        >
                            <Text style={styles.sheetCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        paddingVertical: 12,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    titleContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    titleText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "600",
    },
    defaultTitle: {
        color: "#a0a0a0",
        fontSize: 16,
        fontWeight: "500",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    bottomSheet: {
        backgroundColor: "#1a1a1a",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 48,
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: "#333333",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 20,
    },
    sheetTitle: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 20,
        textAlign: "center",
    },
    sheetOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.05)",
    },
    sheetOptionText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 12,
    },
    sheetOptionTextDanger: {
        color: "#ff5526",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 12,
    },
    sheetCancelButton: {
        marginTop: 20,
        paddingVertical: 16,
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 16,
    },
    sheetCancelText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
});
