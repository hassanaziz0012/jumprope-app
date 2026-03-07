import * as Notifications from "expo-notifications";
import { getNotificationSettings } from "./models/notificationSettings";
import { getCurrentStreak } from "./streaks";
import { getWorkoutsByDateRange } from "./models/workout";
import { getRestDays } from "./models/restDays";

// Helper to format date as YYYY-MM-DD
function toYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const STREAK_NOTIFICATION_ID = "streak_reminder";
const WEEKLY_DIGEST_NOTIFICATION_ID = "weekly_digest_reminder";

export async function scheduleWeeklyDigestNotification(): Promise<void> {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    // First cancel existing scheduled notification
    await Notifications.cancelScheduledNotificationAsync(WEEKLY_DIGEST_NOTIFICATION_ID);

    const settings = await getNotificationSettings();

    // If setting is off, just leave it cancelled and return
    if (!settings?.weekly_summary_digest) return;

    // Schedule weekly notification for every Sunday at 9:00 AM
    await Notifications.scheduleNotificationAsync({
        identifier: WEEKLY_DIGEST_NOTIFICATION_ID,
        content: {
            title: "Your Weekly Digest is ready! 📊",
            body: "Read your weekly digest and see how you performed this week!",
            sound: true,
            data: { url: "/weekly-digest" },
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: 1, // Sunday (1 = Sunday in expo-notifications)
            hour: 9,
            minute: 0,
        },
    });
}

export async function requestNotificationPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    return finalStatus === "granted";
}

export async function scheduleStreakNotification(): Promise<void> {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    // First cancel existing scheduled notification
    await Notifications.cancelScheduledNotificationAsync(STREAK_NOTIFICATION_ID);

    const settings = await getNotificationSettings();

    // If setting is off, just leave it cancelled and return
    if (!settings?.streaks) return;

    const streak = await getCurrentStreak();

    // Streak must be at least 2 (>= 2) to trigger a warning
    if (streak < 2) return;

    // Find the next upcoming day that is NOT a workout and NOT a rest day.
    // We check from today up to 7 days in the future to keep it lightweight.
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize time

    const endSearchDate = new Date(today);
    endSearchDate.setDate(today.getDate() + 7);

    const startStr = toYYYYMMDD(today);
    const endStr = toYYYYMMDD(endSearchDate);

    // Fetch existing workouts and rest days for the upcoming 7 days
    const workouts = await getWorkoutsByDateRange(startStr, endStr + "T23:59:59");
    const restDays = await getRestDays(startStr, endStr);

    const activeDates = new Set<string>();
    workouts.forEach((w) => activeDates.add(toYYYYMMDD(new Date(w.date))));
    restDays.forEach((d) => activeDates.add(d));

    // Determine the next unlogged day starting today
    let targetDate = new Date(today);
    for (let i = 0; i < 7; i++) {
        const dateStr = toYYYYMMDD(targetDate);
        if (!activeDates.has(dateStr)) {
            // Found the next required day to maintain streak!
            break;
        }
        targetDate.setDate(targetDate.getDate() + 1);
    }

    // Set reminder time to 9:00 AM on the target date
    targetDate.setHours(9, 0, 0, 0);

    const now = new Date();

    // If target date is today but 9 AM has already passed, 
    // we shouldn't schedule a notification in the past.
    // In edge-cases, we might schedule for tomorrow if they missed it, but logic says streak breaks at end of day,
    // so scheduling for tomorrow here only makes sense if today's workout happens. Which is handled by `activeDates.has(dateStr)`.
    if (targetDate > now) {
        await Notifications.scheduleNotificationAsync({
            identifier: STREAK_NOTIFICATION_ID,
            content: {
                title: "Keep your streak alive! 🔥",
                body: `You're on a ${streak}-day streak! Don't forget to work out or take a rest day today.`,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: targetDate,
            },
        });
    }
}
