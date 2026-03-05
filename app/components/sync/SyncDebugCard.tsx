import { StyleSheet, Text, View, Pressable, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SyncDebugCardProps = {
    syncToken: string | null;
};

export function SyncDebugCard({ syncToken }: SyncDebugCardProps) {
    const insets = useSafeAreaInsets();
    const [copied, setCopied] = useState(false);
    const toastTranslateY = useRef(new Animated.Value(200)).current;
    const iconScale = useRef(new Animated.Value(1)).current;

    const handleCopyToken = async () => {
        if (!syncToken || copied) return;
        await Clipboard.setStringAsync(syncToken);
        setCopied(true);
        
        iconScale.setValue(0.5);
        Animated.spring(iconScale, {
            toValue: 1,
            friction: 3,
            tension: 200,
            useNativeDriver: true,
        }).start();

        Animated.spring(toastTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
        }).start();

        setTimeout(() => {
            Animated.timing(toastTranslateY, {
                toValue: 200,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setCopied(false);
            });
        }, 1000);
    };

    return (
        <>
            <View style={styles.card}>
                <View style={styles.debugHeader}>
                    <Text style={styles.debugTitle}>Debug Information</Text>
                </View>
                <Text style={styles.debugDisclaimer}>
                    Each user gets a unique sync token for cloud sync and AI features. This is shown here only for debugging purposes, and should not be used by end users. If I (the developer of this app) ask you for your sync token for debugging purposes, you can copy it below.
                </Text>

                <View style={styles.syncTokenContainer}>
                    <Text style={styles.syncTokenText} numberOfLines={1} ellipsizeMode="middle">
                        {syncToken || "Not Available"}
                    </Text>
                    <Pressable 
                        style={[
                            styles.copyButton,
                            copied && { backgroundColor: "rgba(204, 250, 83, 0.1)" }
                        ]}
                        onPress={handleCopyToken}
                    >
                        <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                            <Ionicons 
                                name={copied ? "checkmark-outline" : "copy-outline"} 
                                size={20} 
                                color={copied ? "#ccfa53" : "#ff5526"} 
                            />
                        </Animated.View>
                    </Pressable>
                </View>
            </View>

            {/* Copy Toast */}
            <Animated.View
                style={[
                    styles.toastContainer,
                    { transform: [{ translateY: toastTranslateY }], bottom: Math.max(insets.bottom, 20) + 20 }
                ]}
                pointerEvents="none"
            >
                <View style={styles.toastContent}>
                    <Ionicons name="checkmark-circle" size={20} color="#ccfa53" style={styles.toastIcon} />
                    <Text style={styles.toastText}>Copied to clipboard</Text>
                </View>
            </Animated.View>
        </>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    debugHeader: {
        marginBottom: 12,
    },
    debugTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ffffff",
    },
    debugDisclaimer: {
        fontSize: 14,
        color: "#a0a0a0",
        lineHeight: 20,
        marginBottom: 16,
    },
    syncTokenContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2a2a2a",
        padding: 12,
        borderRadius: 8,
    },
    syncTokenText: {
        flex: 1,
        color: "#ffffff",
        fontSize: 14,
        fontFamily: "monospace",
    },
    copyButton: {
        padding: 8,
        marginLeft: 8,
        backgroundColor: "rgba(255, 85, 38, 0.1)",
        borderRadius: 6,
    },
    toastContainer: {
        position: "absolute",
        left: 0,
        right: 0,
        alignItems: "center",
        zIndex: 9999,
    },
    toastContent: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
        borderColor: "#2a2a2a",
    },
    toastIcon: {
        marginRight: 8,
    },
    toastText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
});
