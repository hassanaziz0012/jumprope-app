import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migrations";

// Open (or create) the database
export const db = SQLite.openDatabaseSync("jumprope.db");

// Initialize database tables
export async function initDatabase(): Promise<void> {
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      image TEXT,
      ai_enabled INTEGER DEFAULT 0,
      synced INTEGER DEFAULT 0,
      sync_enabled INTEGER DEFAULT 0,
      last_sync TEXT,
      sync_token TEXT UNIQUE,
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
      synced INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      daily_skips INTEGER,
      weekly_skips INTEGER,
      weekly_workouts INTEGER,
      daily_calories INTEGER,
      weekly_calories INTEGER,
      weekly_duration INTEGER,
      skip_rate_goal REAL,
      synced INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rest_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      synced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS charts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric TEXT NOT NULL,
      time_range TEXT NOT NULL,
      type TEXT NOT NULL,
      synced INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notification_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      streaks INTEGER DEFAULT 1,
      motivation INTEGER DEFAULT 1,
      weekly_summary_digest INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

    // Run database migrations
    await runMigrations(db);
}

export * from "./models/restDays";
export * from "./models/userProfile";
export * from "./models/workout";
export * from "./models/goals";
export * from "./models/charts";
export * from "./models/notificationSettings";

// Utility function to reset all data as unsynced
export async function markAllDataAsUnsynced(): Promise<void> {
    await db.runAsync(`UPDATE workout SET synced = 0`);
    await db.runAsync(`UPDATE goals SET synced = 0`);
    await db.runAsync(`UPDATE rest_days SET synced = 0`);
    await db.runAsync(`UPDATE charts SET synced = 0`);
}
