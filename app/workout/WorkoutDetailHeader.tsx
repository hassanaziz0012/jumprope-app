import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface WorkoutDetailHeaderProps {
    onBack: () => void;
    onShare: () => void;
    onEdit: () => void;
}

export default function WorkoutDetailHeader({
    onBack,
    onShare,
    onEdit,
}: WorkoutDetailHeaderProps) {
    return (
        <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={onBack} hitSlop={12}>
                <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </Pressable>
            <Text style={styles.headerTitle}>Workout Details</Text>
            <View style={styles.headerActions}>
                <Pressable
                    style={styles.iconButton}
                    onPress={onShare}
                    hitSlop={12}
                >
                    <Ionicons name="share-outline" size={22} color="#ccfa53" />
                </Pressable>
                <Pressable
                    style={styles.iconButton}
                    onPress={onEdit}
                    hitSlop={12}
                >
                    <Ionicons name="pencil" size={22} color="#ff5526" />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
        textAlign: "center",
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    iconButton: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
    },
});
