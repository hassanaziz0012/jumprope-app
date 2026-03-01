import { db } from "../database";

export interface Goals {
    id: number;
    daily_skips: number | null;
    weekly_skips: number | null;
    weekly_workouts: number | null;
    daily_calories: number | null;
    weekly_calories: number | null;
    weekly_duration: number | null;
    skip_rate_goal: number | null;
    synced: number;
    updated_at: string;
}

export async function getGoals(): Promise<Goals | null> {
    const result = await db.getFirstAsync<Goals>("SELECT * FROM goals LIMIT 1");
    return result ?? null;
}

export async function updateGoal(
    goalType: keyof Omit<Goals, "id" | "updated_at">,
    value: number | null
): Promise<void> {
    const existing = await getGoals();
    if (existing) {
        await db.runAsync(
            `UPDATE goals SET ${goalType} = ?, updated_at = CURRENT_TIMESTAMP, synced = 0 WHERE id = ?`,
            [value, existing.id]
        );
    } else {
        await db.runAsync(`INSERT INTO goals (${goalType}) VALUES (?)`, [
            value,
        ]);
    }
}

export async function clearGoal(
    goalType: keyof Omit<Goals, "id" | "updated_at">
): Promise<void> {
    await updateGoal(goalType, null);
}

export async function getUnsyncedGoals(): Promise<Goals | null> {
    const result = await db.getFirstAsync<Goals>("SELECT * FROM goals WHERE synced = 0 LIMIT 1");
    return result ?? null;
}

export async function markGoalAsSynced(id: number): Promise<void> {
    await db.runAsync("UPDATE goals SET synced = 1 WHERE id = ?", [id]);
}
