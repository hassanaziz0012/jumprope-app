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
    setSyncEnabled,
    clearUserProfile,
} from "./database";
import { setSyncState } from "./syncState";
import { apiClient } from "./apiClient";
import { showToast } from "./toastState";
import { router } from "expo-router";

let isRedirectingToOnboarding = false;

export function isUserNotFoundError(error: any): boolean {
    return (
        error?.status === 404 ||
        (typeof error?.message === "string" &&
            (error.message.includes("User account not found") ||
                error.message.includes("User not found")))
    );
}

export async function handleAccountNotFound() {
    if (isRedirectingToOnboarding) return;
    isRedirectingToOnboarding = true;

    try {
        await clearUserProfile();
        showToast("User account not found. Please sign up or log in.", "error", 4000);
        router.replace("/onboarding" as any);
    } catch (e) {
        console.error("Error redirecting to onboarding:", e);
    } finally {
        setTimeout(() => {
            isRedirectingToOnboarding = false;
        }, 3000);
    }
}

/**
 * Synchronize all workouts to the backend API.
 */
export async function syncWorkouts() {
    const userProfile = await getUserProfile();
    if (!userProfile) return;

    const workouts = await getUnsyncedWorkouts();
    if (workouts.length === 0) return;

    const res = await apiClient("/sync/workouts", {
        body: {
            user: userProfile,
            data: workouts,
        },
        suppressToast: true,
    });

    if (res !== null) {
        const workoutIds = workouts.map((w) => w.id);
        await markWorkoutsAsSynced(workoutIds);
        console.log("Workouts synced successfully.");
    }
}

/**
 * Synchronize all goals to the backend API.
 */
export async function syncGoals() {
    const userProfile = await getUserProfile();
    if (!userProfile) return;

    const goals = await getUnsyncedGoals();
    if (!goals) return;

    const goalsList = [goals];

    const res = await apiClient("/sync/goals", {
        body: {
            user: userProfile,
            data: goalsList,
        },
        suppressToast: true,
    });

    if (res !== null) {
        await markGoalAsSynced(goals.id);
        console.log("Goals synced successfully.");
    }
}

/**
 * Synchronize rest days to the backend API.
 */
export async function syncRestDays() {
    const userProfile = await getUserProfile();
    if (!userProfile) return;

    const restDays = await getUnsyncedRestDays();
    if (restDays.length === 0) return;

    const restDaysList = restDays.map((date) => ({ date }));

    const res = await apiClient("/sync/rest-days", {
        body: {
            user: userProfile,
            data: restDaysList,
        },
        suppressToast: true,
    });

    if (res !== null) {
        await markRestDaysAsSynced(restDays);
        console.log("Rest days synced successfully.");
    }
}

/**
 * Synchronize charts to the backend API.
 */
export async function syncCharts() {
    const userProfile = await getUserProfile();
    if (!userProfile) return;

    const charts = await getUnsyncedCharts();
    if (charts.length === 0) return;

    const res = await apiClient("/sync/charts", {
        body: {
            user: userProfile,
            data: charts,
        },
        suppressToast: true,
    });

    if (res !== null) {
        const chartIds = charts.map((c) => c.id);
        await markChartsAsSynced(chartIds);
        console.log("Charts synced successfully.");
    }
}

/**
 * Synchronize user profile settings to the backend API.
 */
export async function syncUserProfile() {
    const userProfile = await getUserProfile();
    if (!userProfile) return;

    const res = await apiClient("/sync/user", {
        body: userProfile,
        suppressToast: true,
    });

    if (res !== null) {
        console.log("User profile synced successfully.");
    }
}

/**
 * Run all synchronization operations.
 */
export async function runSync() {
    console.log("Starting full sync...");
    const userProfile = await getUserProfile();
    if (!userProfile || !userProfile.sync_enabled) {
        console.log("Sync disabled or no user profile.");
        return;
    }

    setSyncState(true, "SYNCING...");
    await syncUserProfile();
    await syncWorkouts();
    await syncGoals();
    await syncRestDays();
    await syncCharts();
    await setLastSync(new Date().toISOString());
    console.log("Full sync completed.");
    setSyncState(false, "Sync Completed!");
    setTimeout(() => setSyncState(false, ""), 2000);
}

/**
 * Delete all user data from the backend API.
 */
export async function deleteUserData(): Promise<any> {
    const userProfile = await getUserProfile();
    if (!userProfile || !userProfile.sync_token) {
        return null;
    }

    return await apiClient(`/sync/delete-user-data?sync_token=${userProfile.sync_token}`, {
        method: "DELETE",
        suppressToast: true,
    });
}
