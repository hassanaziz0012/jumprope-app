import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Chart, deleteChart, getCharts } from "../lib/database";
import AddChartModal from "./components/AddChartModal";
import ChartDisplay from "./components/ChartDisplay";

export default function ChartsScreen() {
    const insets = useSafeAreaInsets();
    const [modalVisible, setModalVisible] = useState(false);
    const [charts, setCharts] = useState<Chart[]>([]);
    const [loading, setLoading] = useState(true);

    const loadCharts = useCallback(async () => {
        try {
            const data = await getCharts();
            setCharts(data);
        } catch (e) {
            console.error("Failed to load charts", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadCharts();
        }, [loadCharts])
    );

    const hasCharts = charts.length > 0;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Charts</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ccfa53" />
                </View>
            ) : hasCharts ? (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Pressable
                        style={[styles.button, styles.buttonCompact]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons name="add" size={24} color="#000000" />
                        <Text style={styles.buttonText}>Add chart</Text>
                    </Pressable>

                    <View style={styles.chartsList}>
                        {charts.map((chart) => (
                            <ChartDisplay
                                key={chart.id}
                                chart={chart}
                                onDelete={async () => {
                                    await deleteChart(chart.id);
                                    loadCharts();
                                }}
                            />
                        ))}
                    </View>
                </ScrollView>
            ) : (
                <View style={styles.emptyContent}>
                    <Text style={styles.helperText}>
                        Create custom charts here to track your performance
                        across workouts.
                    </Text>

                    <Pressable
                        style={styles.button}
                        onPress={() => setModalVisible(true)}
                    >
                        <Ionicons name="add" size={24} color="#000000" />
                        <Text style={styles.buttonText}>Add chart</Text>
                    </Pressable>
                </View>
            )}

            <AddChartModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onAdded={() => {
                    loadCharts();
                }}
            />
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
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    // Empty state styles
    emptyContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingBottom: 100, // Visual balance
    },
    helperText: {
        fontSize: 16,
        color: "#a0a0a0",
        textAlign: "center",
        marginBottom: 32,
        lineHeight: 24,
    },

    // Populated state styles
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    chartsList: {
        gap: 20,
        marginTop: 20,
    },

    // Button styles
    button: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ccfa53",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 32,
        gap: 8,
        alignSelf: "center",
    },
    buttonCompact: {
        alignSelf: "flex-start",
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000000",
    },
});
