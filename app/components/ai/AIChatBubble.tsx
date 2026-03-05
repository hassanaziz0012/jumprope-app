import React from "react";
import { Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import MarkdownDisplay from "../MarkdownDisplay";

interface AIChatBubbleProps {
    type: "user_message" | "ai_message" | "status" | "tool_call" | "error";
    text?: string;
}

export default function AIChatBubble({ type, text }: AIChatBubbleProps) {
    return (
        <Animated.View 
            entering={FadeInDown.duration(400).springify()}
            style={[
                styles.messageBubble,
                type === "user_message" ? styles.messageUser : styles.messageAI
            ]}
        >
            {type === "ai_message" ? (
                <MarkdownDisplay>
                    {text || ""}
                </MarkdownDisplay>
            ) : (
                <Text style={styles.messageText}>{text}</Text>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
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
});
