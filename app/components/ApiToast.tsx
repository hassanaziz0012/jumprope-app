import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Animated,
    PanResponder,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { subscribeToToast, hideToast, ToastPayload } from "../../lib/toastState";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export function ApiToast() {
    const [toast, setToast] = useState<ToastPayload | null>(null);
    const translateY = useRef(new Animated.Value(150)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isDismissingRef = useRef(false);

    const clearToastTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const dismissToast = (direction: "down" | "left" | "right" = "down") => {
        if (isDismissingRef.current) return;
        isDismissingRef.current = true;
        clearToastTimer();

        if (direction === "left" || direction === "right") {
            const targetX = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
            Animated.timing(translateX, {
                toValue: targetX,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                hideToast();
                isDismissingRef.current = false;
            });
        } else {
            Animated.timing(translateY, {
                toValue: 150,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                hideToast();
                isDismissingRef.current = false;
            });
        }
    };

    useEffect(() => {
        const unsubscribe = subscribeToToast((newToast) => {
            clearToastTimer();

            if (newToast) {
                isDismissingRef.current = false;
                setToast(newToast);

                // Reset position animations
                translateX.setValue(0);
                translateY.setValue(150);

                // Slide up animation
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 6,
                    speed: 12,
                }).start();

                // Auto-dismiss timer after duration (default 3 seconds)
                const duration = newToast.duration || 3000;
                timerRef.current = setTimeout(() => {
                    dismissToast("down");
                }, duration);
            } else {
                setToast(null);
            }
        });

        return () => {
            clearToastTimer();
            unsubscribe();
        };
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Respond to horizontal drag
                return Math.abs(gestureState.dx) > 5;
            },
            onPanResponderGrant: () => {
                // Pause auto-dismiss timer while dragging
                clearToastTimer();
            },
            onPanResponderMove: (_, gestureState) => {
                translateX.setValue(gestureState.dx);
            },
            onPanResponderRelease: (_, gestureState) => {
                const dismissThreshold = 80;
                const velocityThreshold = 0.4;

                if (gestureState.dx > dismissThreshold || gestureState.vx > velocityThreshold) {
                    dismissToast("right");
                } else if (gestureState.dx < -dismissThreshold || gestureState.vx < -velocityThreshold) {
                    dismissToast("left");
                } else {
                    // Spring back to center
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 8,
                    }).start();

                    // Resume auto-dismiss timer
                    clearToastTimer();
                    timerRef.current = setTimeout(() => {
                        dismissToast("down");
                    }, toast?.duration || 3000);
                }
            },
        })
    ).current;

    if (!toast) return null;

    const iconName =
        toast.type === "warning"
            ? "warning-outline"
            : toast.type === "info"
            ? "information-circle-outline"
            : "alert-circle-outline";

    const accentColor =
        toast.type === "warning"
            ? "#f5c542"
            : toast.type === "info"
            ? "#5adb5a"
            : "#ff5526";

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[
                styles.container,
                {
                    transform: [{ translateY }, { translateX }],
                    bottom: Math.max(insets.bottom, 20) + 70,
                },
            ]}
        >
            <View style={[styles.content, { borderColor: accentColor }]}>
                <Ionicons name={iconName} size={22} color={accentColor} style={styles.icon} />
                <Text style={styles.text} numberOfLines={3}>
                    {toast.message}
                </Text>
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
        zIndex: 9999, // Float above all components
    },
    content: {
        flexDirection: "row",
        backgroundColor: "#1a1a1a",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
        borderWidth: 1,
        width: "100%",
    },
    icon: {
        marginRight: 12,
    },
    text: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
        flex: 1,
        lineHeight: 18,
    },
});
