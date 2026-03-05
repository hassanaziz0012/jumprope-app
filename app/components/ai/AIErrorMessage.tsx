import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface AIErrorMessageProps {
    text?: string;
}

export default function AIErrorMessage({ text }: AIErrorMessageProps) {
    return (
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.errorCard}>
            <Ionicons name="alert-circle" size={20} color="#ff5526" />
            <Text style={styles.errorText}>{text}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
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
