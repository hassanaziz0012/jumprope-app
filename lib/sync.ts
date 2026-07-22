import {
    getUserProfile,
    getUnsyncedWorkouts,
    markWorkoutsAsSynced,
    getUnsyncedGoals,
    markGoalAsSynced,
    getUnsyncedRestDays,
    markRestDaysAsSynced,
    getUnsyncedCharts,
    markChartsAsSynced,
    setLastSync,
} from "./database";
import { setSyncState } from "./syncState";
import { apiClient } from "./apiClient";

/**
 * Synchronize all workouts to the backend API.
 */
export async function syncWorkouts() {
    const userProfile = await getUserProfile();
    if (!userProfile) {
        console.error("No user profile found, cannot sync workouts.");
        return;
    }

    const workouts = await getUnsyncedWorkouts();
    if (workouts.length === 0) {
        console.log("No unsynced workouts found.");
        return;
    }

    try {
        await apiClient("/sync/workouts", {
            body: {
                user: userProfile,
                data: workouts,
            },
        });

        const workoutIds = workouts.map(w => w.id);
        await markWorkoutsAsSynced(workoutIds);

        console.log("Workouts synced successfully.");
    } catch (error) {
        console.error("Error syncing workouts:", error);
    }
}

/**
 * Synchronize all goals to the backend API.
 */
export async function syncGoals() {
    const userProfile = await getUserProfile();
    if (!userProfile) {
        console.error("No user profile found, cannot sync goals.");
        return;
    }

    const goals = await getUnsyncedGoals();
    if (!goals) {
        console.log("No unsynced goals found.");
        return;
    }

    // Convert single goal object to a list of objects as requested
    const goalsList = [goals];

    try {
        await apiClient("/sync/goals", {
            body: {
                user: userProfile,
                data: goalsList,
            },
        });

        await markGoalAsSynced(goals.id);

        console.log("Goals synced successfully.");
    } catch (error) {
        console.error("Error syncing goals:", error);
    }
}

/**
 * Synchronize rest days to the backend API.
 */
export async function syncRestDays() {
    const userProfile = await getUserProfile();
    if (!userProfile) {
        console.error("No user profile found, cannot sync rest days.");
        return;
    }

    const restDays = await getUnsyncedRestDays();
    if (restDays.length === 0) {
        console.log("No unsynced rest days found.");
        return;
    }

    // Map array of strings to an array of objects
    const restDaysList = restDays.map(date => ({ date }));

    try {
        await apiClient("/sync/rest-days", {
            body: {
                user: userProfile,
                data: restDaysList,
            },
        });

        await markRestDaysAsSynced(restDays);

        console.log("Rest days synced successfully.");
    } catch (error) {
        console.error("Error syncing rest days:", error);
    }
}

/**
 * Synchronize charts to the backend API.
 */
export async function syncCharts() {
    const userProfile = await getUserProfile();
    if (!userProfile) {
        console.error("No user profile found, cannot sync charts.");
        return;
    }

    const charts = await getUnsyncedCharts();
    if (charts.length === 0) {
        console.log("No unsynced charts found.");
        return;
    }

    try {
        await apiClient("/sync/charts", {
            body: {
                user: userProfile,
                data: charts,
            },
        });

        const chartIds = charts.map(c => c.id);
        await markChartsAsSynced(chartIds);

        console.log("Charts synced successfully.");
    } catch (error) {
        console.error("Error syncing charts:", error);
    }
}

/**
 * Run all synchronization operations.
 */
export async function runSync() {
    console.log("Starting full sync...");
    setSyncState(true, "SYNCING...");
    try {
        await syncWorkouts();
        await syncGoals();
        await syncRestDays();
        await syncCharts();
        await setLastSync(new Date().toISOString());
        console.log("Full sync completed.");
        setSyncState(false, "Sync Completed!");
        setTimeout(() => setSyncState(false, ""), 2000);
    } catch (error) {
        console.error("Sync failed:", error);
        setSyncState(false, "Sync Failed");
        setTimeout(() => setSyncState(false, ""), 2000);
    }
}

/**
 * Synchronize user profile settings to the backend API.
 * This includes the new 'ai_model' field as part of the serialized userProfile payload.
 */
export async function syncUserProfile() {
    const userProfile = await getUserProfile();
    if (!userProfile) {
        console.error("No user profile found, cannot sync user profile.");
        return;
    }

    try {
        await apiClient("/sync/user", {
            body: userProfile,
        });

        console.log("User profile synced successfully.");
    } catch (error) {
        console.error("Error syncing user profile:", error);
    }
}

/**
 * Delete all user data from the backend API.
 */
export async function deleteUserData(): Promise<any> {
    const userProfile = await getUserProfile();
    if (!userProfile) {
        throw new Error("No user profile found");
    }
    if (!userProfile.sync_token) {
        throw new Error("No sync token found for the user");
    }

    return await apiClient(`/sync/delete-user-data?sync_token=${userProfile.sync_token}`, {
        method: "DELETE",
    });
}
