import { Ionicons } from "@expo/vector-icons";
import {
    Pressable,
    StyleSheet,
    Text,
    TextStyle,
    ViewStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    icon?: keyof typeof Ionicons.glyphMap;
    disabled?: boolean;
    style?: ViewStyle;
}

export default function Button({
    title,
    onPress,
    variant = "primary",
    icon,
    disabled = false,
    style,
}: ButtonProps) {
    const getButtonStyle = (): ViewStyle[] => {
        const baseStyles: ViewStyle[] = [styles.button];

        switch (variant) {
            case "primary":
                baseStyles.push(styles.primaryButton);
                break;
            case "secondary":
                baseStyles.push(styles.secondaryButton);
                break;
            case "ghost":
                baseStyles.push(styles.ghostButton);
                break;
        }

        if (disabled) {
            baseStyles.push(styles.disabledButton);
        }

        if (style) {
            baseStyles.push(style);
        }

        return baseStyles;
    };

    const getTextStyle = (): TextStyle[] => {
        const baseStyles: TextStyle[] = [styles.buttonText];

        switch (variant) {
            case "primary":
                baseStyles.push(styles.primaryText);
                break;
            case "secondary":
                baseStyles.push(styles.secondaryText);
                break;
            case "ghost":
                baseStyles.push(styles.ghostText);
                break;
        }

        if (disabled) {
            baseStyles.push(styles.disabledText);
        }

        return baseStyles;
    };

    const getIconColor = (): string => {
        if (disabled) return "#666666";
        switch (variant) {
            case "primary":
                return "#ffffff";
            case "secondary":
            case "ghost":
                return "#ff5526";
        }
    };

    return (
        <Pressable
            style={({ pressed }) => [
                ...getButtonStyle(),
                pressed && !disabled && styles.pressed,
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            {icon && (
                <Ionicons
                    name={icon}
                    size={20}
                    color={getIconColor()}
                    style={styles.icon}
                />
            )}
            <Text style={getTextStyle()}>{title}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        minHeight: 48,
    },
    primaryButton: {
        backgroundColor: "#ff5526",
    },
    secondaryButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#ff5526",
    },
    ghostButton: {
        backgroundColor: "transparent",
    },
    disabledButton: {
        opacity: 0.5,
    },
    pressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    primaryText: {
        color: "#ffffff",
    },
    secondaryText: {
        color: "#ff5526",
    },
    ghostText: {
        color: "#ff5526",
    },
    disabledText: {
        color: "#666666",
    },
    icon: {
        marginRight: 8,
    },
});
