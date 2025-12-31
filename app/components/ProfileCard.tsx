import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface ProfileCardProps {
    name?: string;
    email?: string | null;
    imageUri?: string | null;
    onPress?: () => void;
}

export default function ProfileCard({
    name,
    email,
    imageUri,
    onPress,
}: ProfileCardProps) {
    const displayName = name || "Set up your profile";
    const displayEmail = email || "Tap to add your details";

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && onPress && styles.pressed,
            ]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.avatarContainer}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={32} color="#666666" />
                    </View>
                )}
            </View>

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                    {displayName}
                </Text>
                <Text style={styles.email} numberOfLines={1}>
                    {displayEmail}
                </Text>
            </View>

            {onPress && (
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#666666"
                    style={styles.chevron}
                />
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 16,
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.99 }],
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#2a2a2a",
        alignItems: "center",
        justifyContent: "center",
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: "#a0a0a0",
    },
    chevron: {
        marginLeft: 8,
    },
});
