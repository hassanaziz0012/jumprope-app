import React from "react";
import { StyleSheet, View } from "react-native";
import { BarChart as GiftedBarChart } from "react-native-gifted-charts";

interface BarChartProps {
    data?: {
        value: number;
        label?: string;
        frontColor?: string;
        [key: string]: any;
    }[];
    barWidth?: number;
    height?: number;
    width?: number;
    barBorderRadius?: number;
    noOfSections?: number;
    maxValue?: number;
}

const BarChart: React.FC<BarChartProps> = ({
    data = [],
    barWidth = 14,
    height = 200,
    width,
    barBorderRadius = 4,
    noOfSections = 4,
    maxValue,
}) => {
    // Default data if none provided, just for visualization safety
    const chartData = data.length > 0 ? data : [{ value: 0, label: "" }];

    // Theme colors from styleguide
    const defaultFrontColor = "#ff5526"; // Primary Orange

    // Process data to ensure colors if not provided
    const processedData = chartData.map((item) => ({
        ...item,
        frontColor: item.frontColor || defaultFrontColor,
    }));

    const Y_AXIS_WIDTH = 50;
    const chartWidth = width ? width - Y_AXIS_WIDTH : undefined;

    return (
        <View style={styles.container}>
            <GiftedBarChart
                data={processedData}
                barWidth={barWidth}
                height={height}
                width={chartWidth} // If undefined, it takes full width
                barBorderRadius={barBorderRadius}
                frontColor={defaultFrontColor}
                yAxisThickness={0}
                xAxisThickness={1}
                xAxisColor="#333333"
                yAxisTextStyle={{ color: "#a0a0a0", fontSize: 12 }}
                yAxisLabelWidth={Y_AXIS_WIDTH}
                xAxisLabelTextStyle={{ color: "#a0a0a0", fontSize: 12 }}
                noOfSections={noOfSections}
                maxValue={maxValue}
                initialSpacing={2}
                // Adjusting layout for dark mode
                rulesColor="#333333"
                rulesType="solid"
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

export default BarChart;
