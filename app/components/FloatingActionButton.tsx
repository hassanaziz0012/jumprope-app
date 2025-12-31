import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, ViewStyle } from "react-native";

interface FloatingActionButtonProps {
    onPress: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
}

export default function FloatingActionButton({
    onPress,
    icon = "add",
    style,
}: FloatingActionButtonProps) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.fab,
                pressed && styles.pressed,
                style,
            ]}
            onPress={onPress}
        >
            <Ionicons name={icon} size={28} color="#ffffff" />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#ff5526",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    pressed: {
        transform: [{ scale: 0.95 }],
        opacity: 0.9,
    },
});
