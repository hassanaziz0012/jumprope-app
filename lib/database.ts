import * as SQLite from "expo-sqlite";

// Open (or create) the database
const db = SQLite.openDatabaseSync("jumprope.db");

// Initialize database tables
export async function initDatabase(): Promise<void> {
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      image TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS workout (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      duration INTEGER NOT NULL,
      total_skips INTEGER NOT NULL,
      avg_skips_per_minute REAL,
      trips INTEGER NOT NULL DEFAULT 0,
      calories REAL,
      heart_rate_avg INTEGER,
      heart_rate_max INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// ============ User Profile Functions ============

export async function getUserProfile(): Promise<UserProfile | null> {
    const result = await db.getFirstAsync<UserProfile>(
        "SELECT * FROM user_profile LIMIT 1"
    );
    return result ?? null;
}

export async function saveUserProfile(
    name: string,
    email?: string,
    image?: string
): Promise<void> {
    const existing = await getUserProfile();
    if (existing) {
        await db.runAsync(
            "UPDATE user_profile SET name = ?, email = ?, image = ? WHERE id = ?",
            [name, email ?? null, image ?? null, existing.id]
        );
    } else {
        await db.runAsync(
            "INSERT INTO user_profile (name, email, image) VALUES (?, ?, ?)",
            [name, email ?? null, image ?? null]
        );
    }
}

// ============ Workout Functions ============

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
            trips = ?, calories = ?, heart_rate_avg = ?, heart_rate_max = ?, notes = ?
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

export async function getWorkouts(limit = 50): Promise<Workout[]> {
    return await db.getAllAsync<Workout>(
        "SELECT * FROM workout ORDER BY date DESC LIMIT ?",
        [limit]
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

// ============ Types ============

export interface UserProfile {
    id: number;
    name: string;
    email: string | null;
    image: string | null;
    created_at: string;
}

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

export { db };
