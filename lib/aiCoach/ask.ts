import EventSource from "react-native-sse";

export const getToolDisplayInfo = (toolName: string) => {
    switch (toolName) {
        case "get_workouts":
            return { title: "Fetching Workouts", icon: "calendar" as const };
        case "get_workout_details":
            return { title: "Fetching Workout Details", icon: "barbell" as const };
        case "get_streaks":
            return { title: "Checking Streaks", icon: "flame" as const };
        case "get_goals":
            return { title: "Checking Goals", icon: "trophy" as const };
        case "get_chart_data":
            return { title: "Generating Chart Data", icon: "bar-chart" as const };
        case "create_workout":
            return { title: "Logging Workout", icon: "barbell" as const };
        case "mark_rest_day":
            return { title: "Marking Rest Day", icon: "bed" as const };
        case "set_goal":
            return { title: "Setting Goal", icon: "flag" as const };
        default:
            return { title: `Using tool: ${toolName}`, icon: "build" as const };
    }
};

export const formatToolArgs = (toolName: string, args: Record<string, any> | undefined): { label: string; value: string }[] | null => {
    if (!args || Object.keys(args).length === 0) return null;

    if (toolName === "set_goal" && args.name && args.value !== undefined) {
        const goalLabels: Record<string, string> = {
            daily_skips: "Daily Skips",
            weekly_skips: "Weekly Skips",
            weekly_workouts: "Weekly Workouts",
            daily_calories: "Daily Calories",
            weekly_calories: "Weekly Calories",
            weekly_duration: "Weekly Duration",
            skip_rate_goal: "Skip Rate",
        };

        const label = goalLabels[args.name] || args.name.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
        let valueStr = String(args.value);
        if (args.name.includes("duration")) {
            valueStr = `${args.value} mins`;
        } else if (args.name.includes("calories")) {
            valueStr = `${args.value} kcal`;
        } else if (args.name === "skip_rate_goal") {
            valueStr = `${Math.round(Number(args.value))} jumps/min`;
        }

        return [{ label: "Target Goal", value: label }, { label: "Target Value", value: valueStr }];
    }

    if (toolName === "create_workout") {
        const formatted: { label: string; value: string }[] = [];
        if (args.date) {
            try {
                const date = new Date(args.date);
                if (!isNaN(date.getTime())) {
                    formatted.push({ label: "Date", value: date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) });
                }
            } catch (e) { }
        }
        if (args.duration !== undefined) {
            const m = Math.floor(args.duration / 60);
            const s = args.duration % 60;
            formatted.push({ label: "Duration", value: `${m}m ${s}s` });
        }
        if (args.total_skips !== undefined) formatted.push({ label: "Total Skips", value: String(args.total_skips) });
        if (args.calories !== undefined) formatted.push({ label: "Calories", value: `${args.calories} kcal` });
        if (args.avg_skips_per_minute !== undefined) formatted.push({ label: "Skip Rate", value: `${Math.round(args.avg_skips_per_minute)}/min` });
        return formatted.length > 0 ? formatted : null;
    }

    const formattedArgs: { label: string; value: string }[] = [];

    for (const [key, value] of Object.entries(args)) {
        let displayValue = String(value);
        let displayKey = key.replace(/_/g, " ");
        displayKey = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);

        if ((key === "date_from" || key === "date_to" || key === "date") && typeof value === "string") {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    displayValue = date.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    });
                }
            } catch (e) { }
        }

        if (key === "metric" && typeof value === "string") {
            displayValue = displayValue.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());
        }

        formattedArgs.push({ label: displayKey, value: displayValue });
    }

    return formattedArgs;
};

import { getUserProfile } from "../models/userProfile";
import { API_URL } from "../constants";
import { showToast } from "../toastState";

export interface AskAgentCallbacks {
    onConversationId: (id?: string | null, title?: string | null) => void;
    onStatus: (message: string) => void;
    onToolCall: (tool: string, args?: Record<string, any>) => void;
    onToolResult: (tool: string, result?: any) => void;
    onFinalResponse: (text: string) => void;
    onError: (message?: string) => void;
}

export const askAgent = async (text: string, conversation_id: string | null, callbacks: AskAgentCallbacks, continue_conversation: boolean = false) => {
    const profile = await getUserProfile();
    const es = new EventSource(`${API_URL}/ask-agent`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message: text,
            sync_token: profile?.sync_token || null,
            conversation_id,
            continue_conversation
        })
    });

    es.addEventListener("message", (event: any) => {
        if (!event.data) return;

        try {
            const data = JSON.parse(event.data);

            if (data.type === "conversation_id") {
                callbacks.onConversationId(data.id, data.title);
                return;
            }

            if (data.type === "status") {
                callbacks.onStatus(data.message);
            } else if (data.type === "tool_call") {
                callbacks.onToolCall(data.tool, data.args);
            } else if (data.type === "tool_result") {
                callbacks.onToolResult(data.tool, data.result);
            } else if (data.type === "final_response") {
                callbacks.onFinalResponse(data.text);
                es.close();
            } else if (data.type === "error") {
                const errMsg = data.message || "An error occurred during communication.";
                showToast(errMsg, "error");
                callbacks.onError(errMsg);
                es.close();
            } else if (data.type === "close") {
                es.close();
            }
        } catch (err) {
            console.error("Failed to parse SSE event data:", err);
        }
    });

    es.addEventListener("error", (error: any) => {
        console.error("SSE error:", error);
        // Ignore connection close events disguised as errors during normal operations
        if (error && error.type === "error" && error.message && error.message.includes("closed")) {
            return;
        }

        const errMsg = "Sorry, I encountered an error communicating with the server.";
        showToast(errMsg, "error");
        callbacks.onError(errMsg);
        es.close();
    });

    return es;
};
