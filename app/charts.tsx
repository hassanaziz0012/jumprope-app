import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    ChartDataPoint,
    getChartData,
    Metric,
    METRICS,
    TimeRange,
} from "../lib/charts";
import { Chart, getCharts } from "../lib/database";
import AddChartModal from "./components/AddChartModal";
import BarChart from "./components/BarChart";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Screen padding (20*2) + Card padding (16*2) = 72
const CHART_WIDTH = SCREEN_WIDTH - 72;

const ChartItem = ({ chart }: { chart: Chart }) => {
    const [data, setData] = useState<ChartDataPoint[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const chartData = await getChartData(
                chart.metric as Metric,
                chart.time_range as TimeRange
            );
            setData(chartData);
        };
        loadData();
    }, [chart]);

    // Format title: "Metric"
    const formatTitle = (metric: string) => {
        // Pretty print metric
        let metricName = metric;
        if (Object.values(METRICS).includes(metric as any)) {
            // Find key for this value? Or just format the string
            // e.g. "totalSkips" -> "Total Skips"
            metricName = metric
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase());
        }

        return metricName;
    };

    return (
        <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>
                    {formatTitle(chart.metric)}
                </Text>
                <Text style={styles.chartSubtitle}>
                    {chart.time_range.toUpperCase()}
                </Text>
            </View>
            <View>
                <BarChart data={data} width={CHART_WIDTH} height={200} />
            </View>
        </View>
    );
};

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
                            <ChartItem key={chart.id} chart={chart} />
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
    chartCard: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 16,
        marginBottom: 8,
        overflow: "hidden",
    },
    chartHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    chartTitle: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    chartSubtitle: {
        color: "#a0a0a0",
        fontSize: 12,
        fontWeight: "500",
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
