import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HistoryScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <Text style={styles.title}>History</Text>
            <Text style={styles.subtitle}>
                Your workout history will appear here
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0a0a0a",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#ffffff",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#a0a0a0",
    },
});
