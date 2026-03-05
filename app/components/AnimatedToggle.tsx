import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

interface AnimatedToggleProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    trackColor: { false: string; true: string };
    thumbColor: string;
}

export function AnimatedToggle({ value, onValueChange, trackColor, thumbColor }: AnimatedToggleProps) {
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 250,
            useNativeDriver: false,
        }).start();
    }, [value, animatedValue]);

    const trackBgColor = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [trackColor.false, trackColor.true],
    });

    const thumbPosition = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 22],
    });

    return (
        <Pressable 
            onPress={() => onValueChange(!value)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <Animated.View style={[styles.track, { backgroundColor: trackBgColor }]}>
                <Animated.View 
                    style={[
                        styles.thumb, 
                        { backgroundColor: thumbColor, transform: [{ translateX: thumbPosition }] }
                    ]} 
                />
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    track: {
        width: 48,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
    },
    thumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
});
