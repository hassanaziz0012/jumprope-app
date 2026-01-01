import React from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";

interface AreaChartProps {
    data?: {
        value: number;
        label?: string;
        [key: string]: any;
    }[];
    height?: number;
    width?: number;
    color?: string;
    startFillColor?: string;
    endFillColor?: string;
    startOpacity?: number;
    endOpacity?: number;
    noOfSections?: number;
}

const AreaChart: React.FC<AreaChartProps> = ({
    data = [],
    height = 200,
    width,
    color = "#ff5526", // Primary Orange
    startFillColor = "#ff5526",
    endFillColor = "#ff5526",
    startOpacity = 0.3,
    endOpacity = 0.05,
    noOfSections = 4,
}) => {
    // Process data to ensure clean props for the library
    // const chartData = (data.length > 0 ? data : [{ value: 0 }]).map((item) => ({
    //     value: Number(item.value),
    //     label: item.label,
    // }));
    const chartData = data.map((item) => ({
        value: Number(item.value),
        label: item.label,
    }));

    const Y_AXIS_WIDTH = 50;
    const chartWidth = width ? width - Y_AXIS_WIDTH : undefined;

    const maxValue = Math.max(...chartData.map((d) => d.value));

    return (
        <View style={styles.container}>
            <LineChart
                areaChart
                data={chartData}
                height={height}
                width={chartWidth}
                color={color}
                startFillColor={startFillColor}
                endFillColor={endFillColor}
                startOpacity={startOpacity}
                endOpacity={endOpacity}
                thickness={2}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor="#333333"
                yAxisTextStyle={{ color: "#a0a0a0", fontSize: 12 }}
                yAxisLabelWidth={Y_AXIS_WIDTH}
                xAxisLabelTextStyle={{ color: "#a0a0a0", fontSize: 12 }}
                noOfSections={noOfSections}
                maxValue={maxValue}
                initialSpacing={20}
                spacing={40}
                // Adjusting layout for dark mode
                rulesColor="#333333"
                rulesType="solid"
                // isAnimated
                hideDataPoints={false}
                dataPointsColor={color}
                dataPointsRadius={3}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        // We don't enforce background here to allow flexibility,
        // but the chart text is styled for dark mode.
    },
});

export default AreaChart;
