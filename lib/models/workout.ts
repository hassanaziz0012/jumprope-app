import { db } from "../database";

export interface Workout {
    id: number;
    date: string;
    duration: number; // in seconds
    total_skips: number;
    avg_skips_per_minute: number;
    trips: number;
    calories: number | null;
    heart_rate_avg: number | null;
    heart_rate_max: number | null;
    notes: string | null;
    synced: number;
    created_at: string;
}

export interface CreateWorkoutInput {
    date?: string;
    duration: number; // in seconds
    totalSkips: number;
    avgSkipsPerMinute?: number; // auto-calculated if not provided
    trips?: number;
    calories?: number;
    heartRateAvg?: number;
    heartRateMax?: number;
    notes?: string;
}

export async function createWorkout(
    workout: CreateWorkoutInput
): Promise<number> {
    // Auto-calculate avgSkipsPerMinute if not provided
    const avgSkipsPerMinute =
        workout.avgSkipsPerMinute ??
        (workout.duration > 0
            ? (workout.totalSkips / workout.duration) * 60
            : 0);

    const result = await db.runAsync(
        `INSERT INTO workout (date, duration, total_skips, avg_skips_per_minute, trips, calories, heart_rate_avg, heart_rate_max, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            workout.date ?? new Date().toISOString(),
            workout.duration,
            workout.totalSkips,
            avgSkipsPerMinute,
            workout.trips ?? 0,
            workout.calories ?? null,
            workout.heartRateAvg ?? null,
            workout.heartRateMax ?? null,
            workout.notes ?? null,
        ]
    );
    return result.lastInsertRowId;
}

export async function updateWorkout(
    id: number,
    workout: Partial<CreateWorkoutInput>
): Promise<void> {
    const existing = await getWorkout(id);
    if (!existing) {
        throw new Error(`Workout with id ${id} not found`);
    }

    // Merge existing with updates
    const updated = {
        date: workout.date ?? existing.date,
        duration: workout.duration ?? existing.duration,
        totalSkips: workout.totalSkips ?? existing.total_skips,
        trips: workout.trips ?? existing.trips,
        calories: workout.calories ?? existing.calories,
        heartRateAvg: workout.heartRateAvg ?? existing.heart_rate_avg,
        heartRateMax: workout.heartRateMax ?? existing.heart_rate_max,
        notes: workout.notes ?? existing.notes,
    };

    // Recalculate avgSkipsPerMinute
    const avgSkipsPerMinute =
        workout.avgSkipsPerMinute ??
        (updated.duration > 0
            ? (updated.totalSkips / updated.duration) * 60
            : 0);

    await db.runAsync(
        `UPDATE workout SET 
            date = ?, duration = ?, total_skips = ?, avg_skips_per_minute = ?, 
            trips = ?, calories = ?, heart_rate_avg = ?, heart_rate_max = ?, notes = ?, synced = 0
         WHERE id = ?`,
        [
            updated.date,
            updated.duration,
            updated.totalSkips,
            avgSkipsPerMinute,
            updated.trips,
            updated.calories ?? null,
            updated.heartRateAvg ?? null,
            updated.heartRateMax ?? null,
            updated.notes ?? null,
            id,
        ]
    );
}

export async function deleteWorkout(id: number): Promise<void> {
    await db.runAsync("DELETE FROM workout WHERE id = ?", [id]);
}

// Used for export
export async function getAllWorkouts(): Promise<Workout[]> {
    return await db.getAllAsync<Workout>(
        "SELECT * FROM workout ORDER BY date DESC"
    );
}

export async function getWorkouts(limit = 50, offset = 0): Promise<Workout[]> {
    return await db.getAllAsync<Workout>(
        "SELECT * FROM workout ORDER BY date DESC LIMIT ? OFFSET ?",
        [limit, offset]
    );
}

export async function getWorkout(id: number): Promise<Workout | null> {
    const result = await db.getFirstAsync<Workout>(
        "SELECT * FROM workout WHERE id = ?",
        [id]
    );
    return result ?? null;
}

export async function getRecentWorkouts(days = 7): Promise<Workout[]> {
    return await db.getAllAsync<Workout>(
        `SELECT * FROM workout 
         WHERE date >= datetime('now', '-' || ? || ' days') 
         ORDER BY date DESC`,
        [days]
    );
}

export async function getWorkoutsByDateRange(
    startDate: string,
    endDate: string
): Promise<Workout[]> {
    return await db.getAllAsync<Workout>(
        `SELECT * FROM workout 
         WHERE date >= ? AND date <= ? 
         ORDER BY date DESC`,
        [startDate, endDate]
    );
}

export async function getUnsyncedWorkouts(): Promise<Workout[]> {
    return await db.getAllAsync<Workout>(
        "SELECT * FROM workout WHERE synced = 0 ORDER BY date DESC"
    );
}

export async function markWorkoutsAsSynced(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const placeholders = ids.map(() => '?').join(',');
    await db.runAsync(`UPDATE workout SET synced = 1 WHERE id IN (${placeholders})`, ids);
}
