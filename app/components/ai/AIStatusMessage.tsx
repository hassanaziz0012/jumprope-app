import React from 'react';
import { Text, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface AIStatusMessageProps {
    text?: string;
    isLatest: boolean;
}

export default function AIStatusMessage({ text, isLatest }: AIStatusMessageProps) {
    return (
        <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.statusContainer}>
            {isLatest ? (
                <ActivityIndicator size="small" color="#ccfa53" style={styles.statusIcon} />
            ) : (
                <Ionicons name="checkmark-circle" size={14} color="#a0a0a0" style={styles.statusIcon} />
            )}
            <Text style={styles.statusText}>{text}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
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
});
