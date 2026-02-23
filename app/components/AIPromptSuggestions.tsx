import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface AIPromptSuggestionsProps {
    onSelectOption: (prompt: string) => void;
}

const SUGGESTIONS = [
    "How was my week?",
    "Am I improving?",
    "Suggest a goal for me.",
    "Log today's workout.",
];

export default function AIPromptSuggestions({
    onSelectOption,
}: AIPromptSuggestionsProps) {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {SUGGESTIONS.map((suggestion) => (
                    <TouchableOpacity
                        key={suggestion}
                        style={styles.suggestionButton}
                        onPress={() => onSelectOption(suggestion)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        gap: 12,
        marginTop: 24,
        alignItems: "center",
    },
    row: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
        flexWrap: "wrap",
    },
    suggestionButton: {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderWidth: 1,
        borderColor: "rgba(204, 250, 83, 0.4)", // Primary Lime border with opacity
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    suggestionText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "500",
    },
});
