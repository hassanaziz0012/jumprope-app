import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";

// Array of migration functions. Index in the array corresponds to the database version
// it targets.
// e.g., index 0 = Version 1 migration (moving from Version 0 to Version 1)
const MIGRATIONS = [
    // Version 1: Add ai_enabled to user_profile
    async (db: SQLite.SQLiteDatabase) => {
        const userInfo = await db.getAllAsync<{ name: string }>(
            "PRAGMA table_info(user_profile)"
        );
        if (!userInfo.some((col) => col.name === "ai_enabled")) {
            await db.execAsync(
                "ALTER TABLE user_profile ADD COLUMN ai_enabled INTEGER DEFAULT 0;"
            );
        }
    },
    // Version 2: Add synced to all tables
    async (db: SQLite.SQLiteDatabase) => {
        const tables = ["user_profile", "workout", "goals", "rest_days", "charts"];
        for (const table of tables) {
            const tableInfo = await db.getAllAsync<{ name: string }>(
                `PRAGMA table_info(${table})`
            );
            if (!tableInfo.some((col) => col.name === "synced")) {
                await db.execAsync(
                    `ALTER TABLE ${table} ADD COLUMN synced INTEGER DEFAULT 0;`
                );
            }
        }
    },
    // Version 3: Add sync settings to user_profile
    async (db: SQLite.SQLiteDatabase) => {
        const userInfo = await db.getAllAsync<{ name: string }>(
            "PRAGMA table_info(user_profile)"
        );
        if (!userInfo.some((col) => col.name === "sync_enabled")) {
            await db.execAsync(
                "ALTER TABLE user_profile ADD COLUMN sync_enabled INTEGER DEFAULT 0;"
            );
        }
        if (!userInfo.some((col) => col.name === "last_sync")) {
            await db.execAsync(
                "ALTER TABLE user_profile ADD COLUMN last_sync TEXT;"
            );
        }
    },
    // Version 4: Add sync_token to user_profile
    async (db: SQLite.SQLiteDatabase) => {
        const userInfo = await db.getAllAsync<{ name: string }>(
            "PRAGMA table_info(user_profile)"
        );
        if (!userInfo.some((col) => col.name === "sync_token")) {
            await db.execAsync(
                "ALTER TABLE user_profile ADD COLUMN sync_token TEXT;"
            );
            // Populate sync_token for existing profiles
            const users = await db.getAllAsync<{ id: number }>(
                "SELECT id FROM user_profile WHERE sync_token IS NULL"
            );
            for (const user of users) {
                await db.runAsync(
                    "UPDATE user_profile SET sync_token = ? WHERE id = ?",
                    [Crypto.randomUUID(), user.id]
                );
            }
            // Create a unique index instead of adding UNIQUE constraint to column directly
            await db.execAsync(
                "CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profile_sync_token ON user_profile(sync_token);"
            );
        }
    },
];

export async function runMigrations(db: SQLite.SQLiteDatabase) {
    try {
        let response = await db.getFirstAsync<{ user_version: number }>(
            "PRAGMA user_version"
        );
        let currentDbVersion = response?.user_version ?? 0;

        if (currentDbVersion >= MIGRATIONS.length) {
            console.log("Database is up to date");
            return;
        }

        console.log(
            `Running database migrations from version ${currentDbVersion} to ${MIGRATIONS.length}...`
        );

        // Run all pending migrations sequentially
        for (let i = currentDbVersion; i < MIGRATIONS.length; i++) {
            console.log(`Applying migration ${i + 1}...`);
            await MIGRATIONS[i](db);
        }

        // Update the database version to match the number of migrations applied
        await db.execAsync(`PRAGMA user_version = ${MIGRATIONS.length}`);
        console.log("Database migrations completed successfully");
    } catch (e) {
        console.error("Error migrating database:", e);
        throw e;
    }
}
