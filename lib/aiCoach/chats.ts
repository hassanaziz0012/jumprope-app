import { getUserProfile } from "../database";
import { apiClient } from "../apiClient";

export interface BackendToolCall {
    name?: string;
    args?: Record<string, any>;
    [key: string]: any;
}

export interface BackendMessage {
    id: number;
    role: string;
    content?: string | null;
    tool_calls?: BackendToolCall[] | null;
    tool_results?: any[] | null;
    created_at: string;
}

export interface ConversationHistoryResponse {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    messages: BackendMessage[];
}

export async function fetchConversationHistory(conversationId: string): Promise<ConversationHistoryResponse | null> {
    const profile = await getUserProfile();
    if (!profile?.sync_token) {
        throw new Error("No sync token found for user");
    }

    return await apiClient<ConversationHistoryResponse>(
        `/conversations/${conversationId}?sync_token=${profile.sync_token}`
    );
}

export async function deleteConversation(conversationId: string): Promise<void> {
    const profile = await getUserProfile();
    if (!profile?.sync_token) {
        throw new Error("No sync token found for user");
    }

    await apiClient(
        `/conversations/${conversationId}/delete?sync_token=${profile.sync_token}`,
        { method: "DELETE" }
    );
}
