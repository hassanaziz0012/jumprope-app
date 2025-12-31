import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

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
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const clampedProgress = Math.min(Math.max(progress, 0), 1);
    const strokeDashoffset = circumference - clampedProgress * circumference;

    return (
        <View
            style={{
                width: size,
                height: size,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Svg width={size} height={size} style={{ position: "absolute" }}>
                {/* Background Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={unfilledColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${size / 2}, ${size / 2}`}
                />
            </Svg>
            {/* Inner Content */}
            <View
                style={{
                    position: "absolute",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {children}
            </View>
        </View>
    );
}
