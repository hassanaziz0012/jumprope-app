import { db } from "../database";

export interface Chart {
    id: number;
    metric: string;
    time_range: string;
    type: string;
    synced: number;
    created_at: string;
}

export interface CreateChartInput {
    metric: string;
    timeRange: string;
    type: "bar" | "area";
}

export async function addChart(chart: CreateChartInput): Promise<void> {
    await db.runAsync(
        "INSERT INTO charts (metric, time_range, type) VALUES (?, ?, ?)",
        [chart.metric, chart.timeRange, chart.type]
    );
}

export async function getCharts(): Promise<Chart[]> {
    return await db.getAllAsync<Chart>("SELECT * FROM charts ORDER BY id DESC");
}

export async function deleteChart(id: number): Promise<void> {
    await db.runAsync("DELETE FROM charts WHERE id = ?", [id]);
}

export async function getUnsyncedCharts(): Promise<Chart[]> {
    return await db.getAllAsync<Chart>("SELECT * FROM charts WHERE synced = 0 ORDER BY id DESC");
}

export async function markChartsAsSynced(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    const placeholders = ids.map(() => '?').join(',');
    await db.runAsync(`UPDATE charts SET synced = 1 WHERE id IN (${placeholders})`, ids);
}
