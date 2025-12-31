import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SettingsItemVariant = "navigation" | "value" | "custom";

interface SettingsItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    variant?: SettingsItemVariant;
    value?: string;
    onPress?: () => void;
    children?: React.ReactNode;
}

export default function SettingsItem({
    icon,
    title,
    subtitle,
    variant = "navigation",
    value,
    onPress,
    children,
}: SettingsItemProps) {
    const renderRightContent = () => {
        switch (variant) {
            case "navigation":
                return (
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#666666"
                    />
                );
            case "value":
                return (
                    <View style={styles.valueContainer}>
                        <Text style={styles.valueText}>{value}</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#666666"
                        />
                    </View>
                );
            case "custom":
                return children;
            default:
                return null;
        }
    };

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && onPress && styles.pressed,
            ]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={22} color="#a0a0a0" />
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            <View style={styles.rightContent}>{renderRightContent()}</View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    pressed: {
        opacity: 0.8,
        backgroundColor: "#252525",
    },
    iconContainer: {
        width: 32,
        alignItems: "center",
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "500",
        color: "#ffffff",
    },
    subtitle: {
        fontSize: 13,
        color: "#666666",
        marginTop: 2,
    },
    rightContent: {
        marginLeft: 8,
    },
    valueContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    valueText: {
        fontSize: 14,
        color: "#a0a0a0",
        marginRight: 4,
    },
});
