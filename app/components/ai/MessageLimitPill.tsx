import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LIMITS } from "../../../lib/constants";

interface MessageLimitPillProps {
    count: number;
    maxCount?: number;
}

export default function MessageLimitPill({ count, maxCount = LIMITS.AI_CHAT_MESSAGES }: MessageLimitPillProps) {
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    const isVisible = count >= 7;

    useEffect(() => {
        if (isVisible) {
            translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            translateY.value = withTiming(-100, { duration: 300 });
            opacity.value = withTiming(0, { duration: 300 });
        }
    }, [isVisible]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
            <View style={[styles.pill, count >= maxCount && styles.pillMax]}>
                <Ionicons 
                    name="information-circle" 
                    size={18} 
                    color={count >= maxCount ? "#ffffff" : "#0a0a0a"} 
                    style={styles.icon} 
                />
                <Text style={[styles.text, count >= maxCount && styles.textMax]}>
                    {count}/{maxCount} messages used
                </Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 20,
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 100,
        elevation: 10,
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ccfa53", // Primary Lime
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24, // Pill shape
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    pillMax: {
        backgroundColor: "#ff5526", // Warning/Primary Orange when maxed out
    },
    icon: {
        marginRight: 6,
    },
    text: {
        color: "#0a0a0a",
        fontSize: 14,
        fontWeight: "700",
    },
    textMax: {
        color: "#ffffff",
    },
});
