import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, ActivityIndicator } from "react-native";
import { subscribeToSyncState } from "../lib/syncState";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function SyncToast() {
    const [isVisible, setIsVisible] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [message, setMessage] = useState("");
    const translateY = useRef(new Animated.Value(200)).current;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const unsubscribe = subscribeToSyncState((syncing, msg) => {
            setIsSyncing(syncing);
            setMessage(msg || "");

            if (syncing || msg) {
                setIsVisible(true);
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 8,
                }).start();
            } else {
                Animated.timing(translateY, {
                    toValue: 200,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => setIsVisible(false));
            }
        });

        return () => unsubscribe();
    }, [translateY]);

    if (!isVisible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY }], bottom: Math.max(insets.bottom, 20) + 80 },
            ]}
        >
            <View style={styles.content}>
                {isSyncing && (
                    <ActivityIndicator size="small" color="#ff5526" style={styles.spinner} />
                )}
                <Text style={styles.text}>{message}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        left: 20,
        right: 20,
        alignItems: "center",
        zIndex: 9999, // Ensure it floats above everything
        pointerEvents: "none", // Prevent it from blocking touches under it
    },
    content: {
        flexDirection: "row",
        backgroundColor: "#1a1a1a",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: "#2a2a2a",
    },
    spinner: {
        marginRight: 10,
    },
    text: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
});
