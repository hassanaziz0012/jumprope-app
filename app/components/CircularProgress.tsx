import React from "react";
import { StyleSheet, View } from "react-native";

interface CircularProgressProps {
    size: number;
    strokeWidth: number;
    progress: number; // 0 to 1
    color: string;
    unfilledColor?: string;
    children?: React.ReactNode;
}

export default function CircularProgress({
    size,
    strokeWidth,
    progress,
    color,
    unfilledColor = "#e0e0e0",
    children,
}: CircularProgressProps) {
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    const degrees = clampedProgress * 360;

    return (
        <View
            style={{
                width: size,
                height: size,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* Background Circle */}
            <View
                style={[
                    styles.circle,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderWidth: strokeWidth,
                        borderColor: unfilledColor,
                        position: "absolute",
                    },
                ]}
            />

            {/* Progress Arc */}
            <View
                style={{
                    width: size,
                    height: size,
                    position: "absolute",
                    transform: [{ rotate: "-90deg" }], // Start from top
                }}
            >
                {/* First Half (0-180 deg) */}
                <View
                    style={{
                        width: size,
                        height: size,
                        position: "absolute",
                        overflow: "hidden",
                    }}
                >
                    <View
                        style={{
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            borderWidth: strokeWidth,
                            borderColor: color,
                            borderBottomColor: "transparent",
                            borderLeftColor: "transparent",
                            transform: [
                                {
                                    rotate:
                                        degrees > 180
                                            ? "45deg"
                                            : `${-135 + degrees}deg`,
                                },
                            ],
                            opacity: degrees > 0 ? 1 : 0,
                        }}
                    />
                </View>

                {/* Second Half (180-360 deg) */}
                {degrees > 180 && (
                    <View
                        style={{
                            width: size,
                            height: size,
                            position: "absolute",
                            overflow: "hidden",
                        }}
                    >
                        <View
                            style={{
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                borderWidth: strokeWidth,
                                borderColor: color,
                                borderBottomColor: "transparent",
                                borderRightColor: "transparent", // Hide the other side
                                transform: [
                                    { rotate: `${-45 + (degrees - 180)}deg` },
                                ],
                            }}
                        />
                    </View>
                )}
            </View>

            {/* Inner Content */}
            <View style={{ position: "absolute" }}>{children}</View>
        </View>
    );
}

const styles = StyleSheet.create({
    circle: {
        justifyContent: "center",
        alignItems: "center",
    },
});
