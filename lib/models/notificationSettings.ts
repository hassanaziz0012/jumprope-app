import { db } from "../database";
import { getUserProfile } from "./userProfile";

export interface NotificationSettings {
    id: number;
    user_id: number;
    streaks: boolean;
    motivation: boolean;
    weekly_summary_digest: boolean;
    updated_at: string;
}

export async function getNotificationSettings(): Promise<NotificationSettings | null> {
    const user = await getUserProfile();
    if (!user) return null;

    const result = await db.getFirstAsync<any>(
        "SELECT * FROM notification_settings WHERE user_id = ? LIMIT 1",
        [user.id]
    );

    if (!result) {
        // Create default notification settings for user if not exists
        await db.runAsync(
            "INSERT INTO notification_settings (user_id) VALUES (?)",
            [user.id]
        );
        const newResult = await db.getFirstAsync<any>(
            "SELECT * FROM notification_settings WHERE user_id = ? LIMIT 1",
            [user.id]
        );
        if (!newResult) return null;
        return {
            ...newResult,
            streaks: Boolean(newResult.streaks),
            motivation: Boolean(newResult.motivation),
            weekly_summary_digest: Boolean(newResult.weekly_summary_digest),
        } as NotificationSettings;
    }

    return {
        ...result,
        streaks: Boolean(result.streaks),
        motivation: Boolean(result.motivation),
        weekly_summary_digest: Boolean(result.weekly_summary_digest),
    } as NotificationSettings;
}

export async function updateNotificationSetting(
    settingType: keyof Omit<NotificationSettings, "id" | "user_id" | "updated_at">,
    value: boolean
): Promise<void> {
    const existing = await getNotificationSettings();
    if (existing) {
        await db.runAsync(
            `UPDATE notification_settings SET ${settingType} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [value ? 1 : 0, existing.id]
        );
    }
}
