import { getUserProfile } from "../database";

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

export async function fetchConversationHistory(conversationId: string): Promise<ConversationHistoryResponse> {
    const profile = await getUserProfile();
    if (!profile?.sync_token) {
        throw new Error("No sync token found for user");
    }

    const response = await fetch(`https://jumprope-api.vercel.app/conversations/${conversationId}?sync_token=${profile.sync_token}`);
    
    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Failed to fetch conversation history: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
}

export async function deleteConversation(conversationId: string): Promise<void> {
    const profile = await getUserProfile();
    if (!profile?.sync_token) {
        throw new Error("No sync token found for user");
    }

    const response = await fetch(`https://jumprope-api.vercel.app/conversations/${conversationId}/delete?sync_token=${profile.sync_token}`, {
        method: "DELETE",
    });
    
    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`Failed to delete conversation: ${response.status} - ${errorText}`);
    }
}
