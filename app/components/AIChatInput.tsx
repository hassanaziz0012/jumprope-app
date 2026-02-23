import React, { useState } from "react";
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AIChatInputProps {
    onSend: (message: string) => void;
}

export default function AIChatInput({ onSend }: AIChatInputProps) {
    const [text, setText] = useState("");

    const handleSend = () => {
        if (text.trim().length > 0) {
            onSend(text.trim());
            setText("");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            style={styles.container}
        >
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Feel free to ask anything..."
                    placeholderTextColor="#666666"
                    value={text}
                    onChangeText={setText}
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        text.trim().length === 0 && styles.sendButtonDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={text.trim().length === 0}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="arrow-up"
                        size={20}
                        color={text.trim().length === 0 ? "#666666" : "#ffffff"}
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: Platform.OS === "ios" ? 32 : 16,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        minHeight: 56,
    },
    textInput: {
        flex: 1,
        color: "#ffffff",
        fontSize: 15,
        maxHeight: 120,
        paddingTop: 12,
        paddingBottom: 12,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#ff5526",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 12,
    },
    sendButtonDisabled: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
});
