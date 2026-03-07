import EventSource from "react-native-sse";
import { getUserProfile } from "../models/userProfile";
import type { AskAgentCallbacks } from "./ask";

export const generateWeeklyDigest = async (callbacks: AskAgentCallbacks) => {
    const profile = await getUserProfile();
    const es = new EventSource("https://jumprope-api.vercel.app/generate-weekly-digest", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            sync_token: profile?.sync_token || null,
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
                callbacks.onError(data.message);
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
        if (error && error.type === "error" && error.message && error.message.includes("closed")) {
            return;
        }

        callbacks.onError("Sorry, I encountered an error generating your weekly digest.");
        es.close();
    });

    return es;
};
