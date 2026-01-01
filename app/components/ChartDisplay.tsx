import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import {
    ChartDataPoint,
    getChartData,
    Metric,
    METRICS,
    TimeRange,
} from "../../lib/charts";
import { Chart } from "../../lib/database";
import AreaChart from "./AreaChart";
import BarChart from "./BarChart";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Screen padding (20*2) + Card padding (16*2) = 72
const CHART_WIDTH = SCREEN_WIDTH - 72;

interface ChartDisplayProps {
    chart: Chart;
    onDelete?: () => void;
}

export default function ChartDisplay({ chart, onDelete }: ChartDisplayProps) {
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
                <View style={styles.chartMeta}>
                    <Text style={styles.chartSubtitle}>
                        {chart.time_range.toUpperCase()}
                    </Text>
                    {onDelete && (
                        <Pressable
                            onPress={onDelete}
                            style={styles.deleteButton}
                            hitSlop={8}
                        >
                            <Ionicons name="close" size={16} color="#666666" />
                        </Pressable>
                    )}
                </View>
            </View>
            <View>
                {chart.type === "area" ? (
                    <AreaChart data={data} width={CHART_WIDTH} height={200} />
                ) : (
                    <BarChart data={data} width={CHART_WIDTH} height={200} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
    chartMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    deleteButton: {
        padding: 4,
        backgroundColor: "#2a2a2a",
        borderRadius: 12,
    },
});
