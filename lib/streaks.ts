import { getRestDays, getWorkoutsByDateRange } from "./database";

// Helper to format date as YYYY-MM-DD (local time)
export function toYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Helper to subtract days
function subDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
}

/**
 * Calculates the streak ending at endDate.
 * Counts backwards until a break in the chain is found or startDate is reached.
 *
 * @param endDate The date to start counting backwards from (inclusive)
 * @param startDate Optional limit to stop counting at (inclusive)
 */
export async function calculateStreak(
    endDate: Date,
    startDate?: Date
): Promise<number> {
    const endStr = toYYYYMMDD(endDate);
    // If startDate is not provided, go back 365 days by default to capture reasonable streaks,
    // or we could fetch all. 365 days is a safe optimizing limit for now, or maybe 1000.
    // Let's go relatively far back if not specified.
    const startLimit = startDate || subDays(endDate, 365 * 2);
    const startStr = toYYYYMMDD(startLimit);

    // Fetch data
    // existing getWorkoutsByDateRange expects ISO strings or YYYY-MM-DD?
    // Looking at database.ts: "date >= ? AND date <= ?"
    // workout.date is ISO. formatted YYYY-MM-DD comparisons work with ISO strings mostly,
    // but mixing might be risky if we just compare prefix.
    // Ideally we fetch a bit more buffer or use "LIKE" or proper range.
    // Since we need to normalize anyway, let's fetch by range.
    // Note: ISO string "2023-10-10T..." compares string-wise roughly correctly with "2023-10-10" if we correspond.
    // Safer to fetch workouts and process in JS.

    // We'll fetch from startLimit (00:00) to endDate (23:59 equivalent)
    // Actually database strings: "2025-12-31T14:46:16.000Z"
    // We can use the startStr and endStr directly if we assume string comparison works,
    // but better to fetch wider range to be safe.

    // Let's just fetch all workouts for the last X days.
    const workouts = await getWorkoutsByDateRange(
        startStr,
        endStr + "T23:59:59"
    );
    const restDays = await getRestDays(startStr, endStr);

    const activeDates = new Set<string>();

    workouts.forEach((w) => {
        // Parse workout date and convert to YYYY-MM-DD
        const d = new Date(w.date);
        activeDates.add(toYYYYMMDD(d));
    });

    restDays.forEach((d) => {
        activeDates.add(d); // restDays are already YYYY-MM-DD
    });

    let streak = 0;
    let current = new Date(endDate);

    while (current >= startLimit) {
        const dateStr = toYYYYMMDD(current);
        if (activeDates.has(dateStr)) {
            streak++;
            current = subDays(current, 1);
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Gets the current streak.
 * Checks today; if active, counts from today.
 * If today is inactive, checks yesterday. If yesterday active, counts from active.
 * If neither, 0.
 */
export async function getCurrentStreak(): Promise<number> {
    const today = new Date();
    const yesterday = subDays(today, 1);

    // Check availability for today and yesterday first to decide start point
    // We can just call calculateStreak for today.
    // If today is NOT active, calculateStreak(today) returns 0.
    // Then we try calculateStreak(yesterday).

    // Optimization: fetch once for last 2 days to check status?
    // Or just reuse logic.

    let streak = await calculateStreak(today);

    // If streak is > 0, great. it includes today.
    // If streak is 0, it means we haven't worked out today.
    // But we might have a streak alive from yesterday.
    if (streak === 0) {
        streak = await calculateStreak(yesterday);
    }

    return streak;
}

/**
 * Returns streak maintained over the last 7 days (including today).
 * This is effectively `min(currentStreak, 7)` if current streak extends back that far?
 * Or "streak calculated ending today, limited to 7 days lookback".
 * User said: "get the streak for the last week... These can just reuse that function with predefined arguments."
 */
export async function getStreakLastWeek(): Promise<number> {
    const today = new Date();
    const start = subDays(today, 6); // 7 days total: today + 6 days back
    return calculateStreak(today, start);
}

export async function getStreakLastMonth(): Promise<number> {
    const today = new Date();
    const start = subDays(today, 29); // 30 days total
    return calculateStreak(today, start);
}

export async function getStreakLast90Days(): Promise<number> {
    const today = new Date();
    const start = subDays(today, 89); // 90 days total
    return calculateStreak(today, start);
}

export interface DayStreakData {
    date: Date;
    dateStr: string;
    dayLabel: string; // Mon, Tue, etc.
    hasWorkout: boolean;
    isRestDay: boolean;
    isToday: boolean;
    isFuture: boolean;
}

/**
 * Returns detailed day-by-day streak data for the current week (Mon-Sun).
 */
export async function getWeeklyStreakData(): Promise<DayStreakData[]> {
    const today = new Date();
    const todayStr = toYYYYMMDD(today);

    // Get the Monday of current week
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    // Get the Sunday of current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const mondayStr = toYYYYMMDD(monday);
    const sundayStr = toYYYYMMDD(sunday);

    // Fetch workouts and rest days for this week
    const workouts = await getWorkoutsByDateRange(
        mondayStr,
        sundayStr + "T23:59:59"
    );
    const restDays = await getRestDays(mondayStr, sundayStr);

    // Create a set of workout dates
    const workoutDates = new Set<string>();
    workouts.forEach((w) => {
        workoutDates.add(toYYYYMMDD(new Date(w.date)));
    });

    // Create a set of rest day dates
    const restDayDates = new Set<string>(restDays);

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekData: DayStreakData[] = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateStr = toYYYYMMDD(date);

        weekData.push({
            date,
            dateStr,
            dayLabel: dayLabels[i],
            hasWorkout: workoutDates.has(dateStr),
            isRestDay: restDayDates.has(dateStr),
            isToday: dateStr === todayStr,
            isFuture: date > today,
        });
    }

    return weekData;
}

/**
 * Returns detailed day-by-day streak data for a specific month.
 * @param year The year (e.g., 2025)
 * @param month The month (0-11, where 0 = January)
 */
export async function getMonthlyStreakData(
    year: number,
    month: number
): Promise<DayStreakData[]> {
    const today = new Date();
    const todayStr = toYYYYMMDD(today);

    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0);

    const firstDayStr = toYYYYMMDD(firstDay);
    const lastDayStr = toYYYYMMDD(lastDay);

    // Fetch workouts and rest days for this month
    const workouts = await getWorkoutsByDateRange(
        firstDayStr,
        lastDayStr + "T23:59:59"
    );
    const restDays = await getRestDays(firstDayStr, lastDayStr);

    // Create a set of workout dates
    const workoutDates = new Set<string>();
    workouts.forEach((w) => {
        workoutDates.add(toYYYYMMDD(new Date(w.date)));
    });

    // Create a set of rest day dates
    const restDayDates = new Set<string>(restDays);

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthData: DayStreakData[] = [];

    // Get number of days in the month
    const daysInMonth = lastDay.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = toYYYYMMDD(date);

        monthData.push({
            date,
            dateStr,
            dayLabel: dayLabels[date.getDay()],
            hasWorkout: workoutDates.has(dateStr),
            isRestDay: restDayDates.has(dateStr),
            isToday: dateStr === todayStr,
            isFuture: date > today,
        });
    }

    return monthData;
}
