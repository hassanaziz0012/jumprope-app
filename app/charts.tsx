import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChartsScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Charts</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.helperText}>
                    Create custom charts here to track your performance across
                    workouts.
                </Text>

                <Pressable style={styles.button}>
                    <Ionicons name="add" size={24} color="#000000" />
                    <Text style={styles.buttonText}>Add chart</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#ffffff",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    helperText: {
        fontSize: 16,
        color: "#a0a0a0",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 24,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ccfa53",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 32,
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000000",
    },
});
