import { getRecentWorkouts, Workout } from "./database";

// ============ Constants ============

export const METRICS = {
    TOTAL_SKIPS: "totalSkips",
    AVG_SKIPS_PER_MIN: "avgSkipsPerMin",
    CALORIES: "calories",
    TRIPS: "trips",
} as const;

export const CHART_TYPES = {
    BAR: "bar",
    AREA: "area",
} as const;

export const TIME_RANGES = {
    DAYS_7: "7d",
    DAYS_30: "30d",
    DAYS_90: "90d",
} as const;

export type Metric = (typeof METRICS)[keyof typeof METRICS];
export type ChartType = (typeof CHART_TYPES)[keyof typeof CHART_TYPES];
export type TimeRange = (typeof TIME_RANGES)[keyof typeof TIME_RANGES];

// ============ Types ============

export interface ChartDataPoint {
    value: number;
    label: string;
    // properties for react-native-gifted-charts
    frontColor?: string;
    labelTextStyle?: { color: string; fontSize: number };
    date: string; // Keep track of the raw date for debugging/tooltips
}

// ============ Utilities ============

/**
 * Main function to get formatted chart data
 */
export async function getChartData(
    metric: Metric,
    timeRange: TimeRange
): Promise<ChartDataPoint[]> {
    const days = getDaysFromTimeRange(timeRange);
    const workouts = await getRecentWorkouts(days);
    const aggregated = aggregateWorkoutsByDate(workouts, days, metric);
    return aggregated;
}

/**
 * Helper to convert TimeRange enum to number of days
 */
export function getDaysFromTimeRange(range: TimeRange): number {
    switch (range) {
        case TIME_RANGES.DAYS_7:
            return 7;
        case TIME_RANGES.DAYS_30:
            return 30;
        case TIME_RANGES.DAYS_90:
            return 90;
        default:
            return 7;
    }
}

/**
 * Aggregates workouts by date, filling in missing days with zeros.
 */
function aggregateWorkoutsByDate(
    workouts: Workout[],
    days: number,
    metric: Metric
): ChartDataPoint[] {
    const dataPoints: ChartDataPoint[] = [];
    const today = new Date();

    // Create a map for quick lookup
    const workoutsByDate = new Map<string, Workout[]>();

    workouts.forEach((w) => {
        // Assuming date is in ISO format, take the YYYY-MM-DD part
        // Adjust logic if timezone handling is critical, but for now simple slicing is safer than UTC conversion issues locally
        const dateKey = w.date.split("T")[0];
        if (!workoutsByDate.has(dateKey)) {
            workoutsByDate.set(dateKey, []);
        }
        workoutsByDate.get(dateKey)?.push(w);
    });

    // Loop backwards from today for 'days' count
    // We want the chart to go from left (oldest) to right (newest)
    // So we generate the array then reverse it, or loop from (days-1) down to 0
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateKey = d.toISOString().split("T")[0];

        const dayWorkouts = workoutsByDate.get(dateKey) || [];
        const value = calculateMetricValue(dayWorkouts, metric);

        dataPoints.push({
            value,
            label: formatLabel(d, days),
            date: dateKey,
            // Optional: add conditional coloring relative to value here if needed
        });
    }

    return dataPoints;
}

function calculateMetricValue(workouts: Workout[], metric: Metric): number {
    if (workouts.length === 0) return 0;

    switch (metric) {
        case METRICS.TOTAL_SKIPS:
            return workouts.reduce((sum, w) => sum + w.total_skips, 0);

        case METRICS.TRIPS:
            return workouts.reduce((sum, w) => sum + w.trips, 0);

        case METRICS.CALORIES:
            // Calories might be null, treat as 0
            return workouts.reduce((sum, w) => sum + (w.calories || 0), 0);

        case METRICS.AVG_SKIPS_PER_MIN:
            // Weighted average based on duration would be most accurate
            const totalDuration = workouts.reduce(
                (sum, w) => sum + w.duration,
                0
            );
            const totalSkips = workouts.reduce(
                (sum, w) => sum + w.total_skips,
                0
            );

            if (totalDuration === 0) return 0;
            // Duration is in seconds, so multiply by 60 for per-minute
            return Math.round((totalSkips / totalDuration) * 60);

        default:
            return 0;
    }
}

function formatLabel(date: Date, rangeDays: number): string {
    // Format based on range length for readability
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (rangeDays <= 7) {
        // For 7 days, show Day Name (e.g., "Mon")
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[date.getDay()];
    } else if (rangeDays <= 30) {
        // For 30 days, maybe show every 5th day or just the date number
        // Showing date number for all might be crowded but GiftedCharts handles it often
        return `${month}/${day}`;
    } else {
        // For 90 days, we might want to be sparser, but let's return date
        // The UI component can choose to hide some labels with `labelComponent` or specific props if needed
        // For now, simpler is better
        return `${month}/${day}`;
    }
}
