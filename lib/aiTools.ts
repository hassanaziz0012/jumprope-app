import { getWorkout, getWorkoutsByDateRange, Workout } from "./database";

/**
 * Fetches an array of workouts that occurred within a specific date range.
 * This tool should be used when the user asks about workouts over a specific period,
 * like "how many times did I workout last week?" or "show my workouts from October".
 * 
 * @param dateFrom - The start date of the range in ISO format (e.g., "2023-10-01" or "2023-10-01T00:00:00.000Z").
 * @param dateTo - The end date of the range in ISO format (e.g., "2023-10-31" or "2023-10-31T23:59:59.999Z").
 * @returns A promise that resolves to an array of Workout objects falling within the date range.
 */
export async function getWorkouts(
    dateFrom: string,
    dateTo: string
): Promise<Workout[]> {
    return await getWorkoutsByDateRange(dateFrom, dateTo);
}

/**
 * Fetches the full details of a single, specific workout using its unique ID.
 * This tool should be used when you already have a workout ID (e.g., from using getWorkouts)
 * and need to retrieve all the specific stats for that exact workout session, such as 
 * duration, total skips, average skips per minute, trips, calories, heart rate, and notes.
 * 
 * @param id - The unique numerical identifier representing the workout.
 * @returns A promise that resolves to the specific Workout object, or null if no workout is found with that ID.
 */
export async function getWorkoutDetails(id: number): Promise<Workout | null> {
    return await getWorkout(id);
}
