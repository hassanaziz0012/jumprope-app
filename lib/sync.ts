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
} from "./database";

// Define the API URL for the backend
const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://jumprope-tracker-api.vercel.app";

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
        const response = await fetch(`${API_URL}/sync/workouts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user: userProfile,
                data: workouts,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to sync workouts: ${response.statusText}`);
        }
        
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
        const response = await fetch(`${API_URL}/sync/goals`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user: userProfile,
                data: goalsList,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to sync goals: ${response.statusText}`);
        }
        
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
        const response = await fetch(`${API_URL}/sync/rest-days`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user: userProfile,
                data: restDaysList,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to sync rest days: ${response.statusText}`);
        }
        
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
        const response = await fetch(`${API_URL}/sync/charts`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user: userProfile,
                data: charts,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to sync charts: ${response.statusText}`);
        }
        
        const chartIds = charts.map(c => c.id);
        await markChartsAsSynced(chartIds);

        console.log("Charts synced successfully.");
    } catch (error) {
        console.error("Error syncing charts:", error);
    }
}
