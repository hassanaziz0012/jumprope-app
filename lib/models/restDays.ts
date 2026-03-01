import { db } from "../database";

export async function addRestDay(date: string): Promise<void> {
    try {
        await db.runAsync("INSERT INTO rest_days (date) VALUES (?)", [date]);
    } catch (e) {
        // Ignore unique constraint violations (duplicate dates)
        console.log("Rest day already exists or other error:", e);
    }
}

export async function removeRestDay(date: string): Promise<void> {
    await db.runAsync("DELETE FROM rest_days WHERE date = ?", [date]);
}

export async function getRestDays(
    startDate?: string,
    endDate?: string
): Promise<string[]> {
    let query = "SELECT date FROM rest_days";
    const params: string[] = [];

    if (startDate && endDate) {
        query += " WHERE date >= ? AND date <= ?";
        params.push(startDate, endDate);
    } else if (startDate) {
        query += " WHERE date >= ?";
        params.push(startDate);
    } else if (endDate) {
        query += " WHERE date <= ?";
        params.push(endDate);
    }

    query += " ORDER BY date ASC";

    const results = await db.getAllAsync<{ date: string }>(query, params);
    return results.map((r) => r.date);
}

export async function getUnsyncedRestDays(): Promise<string[]> {
    const results = await db.getAllAsync<{ date: string }>("SELECT date FROM rest_days WHERE synced = 0 ORDER BY date ASC");
    return results.map((r) => r.date);
}

export async function markRestDaysAsSynced(dates: string[]): Promise<void> {
    if (dates.length === 0) return;
    const placeholders = dates.map(() => '?').join(',');
    await db.runAsync(`UPDATE rest_days SET synced = 1 WHERE date IN (${placeholders})`, dates);
}
