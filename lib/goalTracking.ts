import { db, getGoals } from "./database";

// Helper to get start of day (midnight)
export function getStartOfDay(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
}

// Helper to get end of day
export function getEndOfDay(date: Date): string {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
}

// Helper to get start of week (Monday)
export function getStartOfWeek(date: Date): string {
    const d = new Date(date);
    const day = d.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
}

// Helper to get end of week (Sunday night)
export function getEndOfWeek(date: Date): string {
    const d = new Date(getStartOfWeek(date));
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
}

export async function trackGoals(workoutDate?: string | Date) {
    const date = workoutDate ? new Date(workoutDate) : new Date();

    try {
        const goals = await getGoals();
        if (!goals) {
            console.log("[GoalTracking] No goals set.");
            return;
        }

        console.log(
            `[GoalTracking] Checking goals for date: ${date.toISOString()}`
        );

        const startOfDay = getStartOfDay(date);
        const endOfDay = getEndOfDay(date);
        const startOfWeek = getStartOfWeek(date);
        const endOfWeek = getEndOfWeek(date);

        // 1. Daily Skips
        if (goals.daily_skips) {
            const dailySkips = await getDailySameMetricTotal(
                "total_skips",
                startOfDay,
                endOfDay
            );
            console.log(
                `[GoalTracking] Daily Skips: ${dailySkips} / ${goals.daily_skips}`
            );
        }

        // 2. Weekly Skips
        if (goals.weekly_skips) {
            const weeklySkips = await getDailySameMetricTotal(
                "total_skips",
                startOfWeek,
                endOfWeek
            );
            console.log(
                `[GoalTracking] Weekly Skips: ${weeklySkips} / ${goals.weekly_skips}`
            );
        }

        // 3. Daily Calories
        if (goals.daily_calories) {
            const dailyCal = await getDailySameMetricTotal(
                "calories",
                startOfDay,
                endOfDay
            );
            console.log(
                `[GoalTracking] Daily Calories: ${dailyCal} / ${goals.daily_calories}`
            );
        }

        // 4. Weekly Calories
        if (goals.weekly_calories) {
            const weeklyCal = await getDailySameMetricTotal(
                "calories",
                startOfWeek,
                endOfWeek
            );
            console.log(
                `[GoalTracking] Weekly Calories: ${weeklyCal} / ${goals.weekly_calories}`
            );
        }

        // 5. Weekly Duration (minutes)
        if (goals.weekly_duration) {
            // duration is stored in seconds
            const weeklyDurationSec = await getDailySameMetricTotal(
                "duration",
                startOfWeek,
                endOfWeek
            );
            const weeklyDurationMin = Math.round(weeklyDurationSec / 60);
            console.log(
                `[GoalTracking] Weekly Duration: ${weeklyDurationMin} min / ${goals.weekly_duration} min`
            );
        }

        // 6. Skip Rate Goal (Latest workout)
        if (goals.skip_rate_goal) {
            const latestRate = await getLatestSkipRate();
            if (latestRate !== null) {
                console.log(
                    `[GoalTracking] Latest Skip Rate: ${latestRate} / ${goals.skip_rate_goal}`
                );
            }
        }
    } catch (error) {
        console.error("[GoalTracking] Error tracking goals:", error);
    }
}

async function getDailySameMetricTotal(
    column: string,
    startDate: string,
    endDate: string
): Promise<number> {
    const result = await db.getFirstAsync<{ total: number }>(
        `SELECT SUM(${column}) as total FROM workout WHERE date >= ? AND date <= ?`,
        [startDate, endDate]
    );
    return result?.total ?? 0;
}

async function getLatestSkipRate(): Promise<number | null> {
    const result = await db.getFirstAsync<{ avg_skips_per_minute: number }>(
        `SELECT avg_skips_per_minute FROM workout ORDER BY date DESC LIMIT 1`
    );
    return result?.avg_skips_per_minute ?? null;
}

export interface GoalProgressItem {
    key: string;
    label: string;
    current: number;
    target: number;
    unit: string;
    progress: number; // 0 to 1
}

export async function getGoalProgress(): Promise<GoalProgressItem[]> {
    try {
        const goals = await getGoals();
        if (!goals) return [];

        const now = new Date();
        const startOfDay = getStartOfDay(now);
        const endOfDay = getEndOfDay(now);
        const startOfWeek = getStartOfWeek(now);
        const endOfWeek = getEndOfWeek(now);

        const progressItems: GoalProgressItem[] = [];

        // 1. Daily Skips
        if (goals.daily_skips) {
            const current = await getDailySameMetricTotal(
                "total_skips",
                startOfDay,
                endOfDay
            );
            progressItems.push({
                key: "daily_skips",
                label: "Daily Skips",
                current,
                target: goals.daily_skips,
                unit: "",
                progress: Math.min(current / goals.daily_skips, 1),
            });
        }

        // 2. Weekly Skips
        if (goals.weekly_skips) {
            const current = await getDailySameMetricTotal(
                "total_skips",
                startOfWeek,
                endOfWeek
            );
            progressItems.push({
                key: "weekly_skips",
                label: "Weekly Skips",
                current,
                target: goals.weekly_skips,
                unit: "",
                progress: Math.min(current / goals.weekly_skips, 1),
            });
        }

        // 3. Weekly Workouts
        if (goals.weekly_workouts) {
            const result = await db.getFirstAsync<{ count: number }>(
                `SELECT COUNT(*) as count FROM workout WHERE date >= ? AND date <= ?`,
                [startOfWeek, endOfWeek]
            );
            const current = result?.count ?? 0;
            progressItems.push({
                key: "weekly_workouts",
                label: "Weekly Workouts",
                current,
                target: goals.weekly_workouts,
                unit: "",
                progress: Math.min(current / goals.weekly_workouts, 1),
            });
        }

        // 4. Daily Calories
        if (goals.daily_calories) {
            const current = await getDailySameMetricTotal(
                "calories",
                startOfDay,
                endOfDay
            );
            progressItems.push({
                key: "daily_calories",
                label: "Daily Calories",
                current,
                target: goals.daily_calories,
                unit: "kcal",
                progress: Math.min(current / goals.daily_calories, 1),
            });
        }

        // 5. Weekly Calories
        if (goals.weekly_calories) {
            const current = await getDailySameMetricTotal(
                "calories",
                startOfWeek,
                endOfWeek
            );
            progressItems.push({
                key: "weekly_calories",
                label: "Weekly Calories",
                current,
                target: goals.weekly_calories,
                unit: "kcal",
                progress: Math.min(current / goals.weekly_calories, 1),
            });
        }

        // 6. Weekly Duration
        if (goals.weekly_duration) {
            const currentSec = await getDailySameMetricTotal(
                "duration",
                startOfWeek,
                endOfWeek
            );
            const currentMin = Math.round(currentSec / 60);
            progressItems.push({
                key: "weekly_duration",
                label: "Weekly Duration",
                current: currentMin,
                target: goals.weekly_duration,
                unit: "min",
                progress: Math.min(currentMin / goals.weekly_duration, 1),
            });
        }

        // 7. Skip Rate Goal
        if (goals.skip_rate_goal) {
            const current = (await getLatestSkipRate()) ?? 0;
            progressItems.push({
                key: "skip_rate_goal",
                label: "Skip Rate",
                current: Math.round(current),
                target: goals.skip_rate_goal,
                unit: "spm",
                progress: Math.min(current / goals.skip_rate_goal, 1),
            });
        }

        return progressItems;
    } catch (error) {
        console.error("Error getting goal progress:", error);
        return [];
    }
}
