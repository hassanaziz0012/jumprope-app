import { Ionicons } from "@expo/vector-icons";
import { Goals } from "./database";

export type GoalKey = keyof Omit<Goals, "id" | "updated_at">;

export interface GoalTemplate {
    key: GoalKey;
    title: string;
    description: string;
    period: string;
    icon: keyof typeof Ionicons.glyphMap;
    unit: string;
    placeholder: string;
}

export const goalTemplates: GoalTemplate[] = [
    {
        key: "daily_skips",
        title: "Daily Skips",
        description: "Hit X total skips per day",
        period: "Daily",
        icon: "repeat-outline",
        unit: "skips",
        placeholder: "e.g. 1000",
    },
    {
        key: "weekly_skips",
        title: "Weekly Skips",
        description: "Hit X total skips per week",
        period: "Weekly (Mon-Sun)",
        icon: "trending-up-outline",
        unit: "skips",
        placeholder: "e.g. 7000",
    },
    {
        key: "weekly_workouts",
        title: "Weekly Workouts",
        description: "Complete X workouts per week",
        period: "Weekly",
        icon: "calendar-outline",
        unit: "workouts",
        placeholder: "e.g. 5",
    },
    {
        key: "daily_calories",
        title: "Daily Calories",
        description: "Burn X calories per day",
        period: "Daily",
        icon: "flame-outline",
        unit: "kcal",
        placeholder: "e.g. 300",
    },
    {
        key: "weekly_calories",
        title: "Weekly Calories",
        description: "Burn X calories per week",
        period: "Weekly",
        icon: "bonfire-outline",
        unit: "kcal",
        placeholder: "e.g. 2000",
    },
    {
        key: "weekly_duration",
        title: "Weekly Duration",
        description: "Jump for X minutes per week",
        period: "Weekly",
        icon: "time-outline",
        unit: "minutes",
        placeholder: "e.g. 60",
    },
    {
        key: "skip_rate_goal",
        title: "Skip Rate Goal",
        description: "Maintain X avg skips/min",
        period: "Per workout",
        icon: "speedometer-outline",
        unit: "skips/min",
        placeholder: "e.g. 120",
    },
];