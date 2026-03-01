import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface MarkdownDisplayProps {
    children: string;
}

export default function MarkdownDisplay({ children }: MarkdownDisplayProps) {
    return (
        <Markdown style={markdownStyles}>
            {children}
        </Markdown>
    );
}

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
