import { db } from "../database";
import * as Crypto from "expo-crypto";

export type AIProvider = 'Claude' | 'ChatGPT' | 'Gemini' | 'Groq' | 'Grok' | 'DeepSeek' | 'Mistral' | 'Ollama' | 'Cohere';

export interface UserProfile {
    id: number;
    name: string;
    email: string | null;
    image: string | null;
    ai_enabled: boolean;
    ai_provider: AIProvider | null;
    api_key: string | null;
    ai_model: string | null;
    synced: number;
    sync_enabled: boolean;
    last_sync: string | null;
    sync_token: string | null;
    created_at: string;
}

export async function getUserProfile(): Promise<UserProfile | null> {
    const result = await db.getFirstAsync<any>(
        "SELECT * FROM user_profile LIMIT 1"
    );
    if (!result) return null;
    return {
        ...result,
        ai_enabled: Boolean(result.ai_enabled),
        sync_enabled: Boolean(result.sync_enabled),
    } as UserProfile;
}

export async function clearUserProfile(): Promise<void> {
    await db.runAsync("DELETE FROM user_profile");
}

export async function saveUserProfile(
    name: string,
    email?: string,
    image?: string,
    aiEnabled?: boolean,
    aiProvider?: AIProvider | null,
    apiKey?: string | null,
    aiModel?: string | null
): Promise<void> {
    const existing = await getUserProfile();
    if (existing) {
        await db.runAsync(
            "UPDATE user_profile SET name = ?, email = ?, image = ?, ai_enabled = ?, ai_provider = ?, api_key = ?, ai_model = ?, synced = 0 WHERE id = ?",
            [
                name,
                email ?? null,
                image ?? null,
                aiEnabled !== undefined
                    ? aiEnabled
                        ? 1
                        : 0
                    : existing.ai_enabled
                    ? 1
                    : 0,
                aiProvider !== undefined ? aiProvider : existing.ai_provider,
                apiKey !== undefined ? apiKey : existing.api_key,
                aiModel !== undefined ? aiModel : existing.ai_model,
                existing.id,
            ]
        );
    }
}

export async function setSyncEnabled(enabled: boolean): Promise<void> {
    const existing = await getUserProfile();
    if (existing) {
        await db.runAsync(
            "UPDATE user_profile SET sync_enabled = ?, synced = 0 WHERE id = ?",
            [enabled ? 1 : 0, existing.id]
        );
    }
}

export async function setLastSync(dateStr: string): Promise<void> {
    const existing = await getUserProfile();
    if (existing) {
        await db.runAsync(
            "UPDATE user_profile SET last_sync = ?, synced = 0 WHERE id = ?",
            [dateStr, existing.id]
        );
    }
}

export async function saveAuthUserProfile(params: {
    name: string;
    email: string;
    syncToken: string;
    aiEnabled?: boolean;
    syncEnabled?: boolean;
}): Promise<void> {
    const existing = await getUserProfile();
    if (existing) {
        await db.runAsync(
            "UPDATE user_profile SET name = ?, email = ?, sync_token = ?, ai_enabled = ?, sync_enabled = ?, synced = 1 WHERE id = ?",
            [
                params.name,
                params.email,
                params.syncToken,
                params.aiEnabled !== undefined ? (params.aiEnabled ? 1 : 0) : existing.ai_enabled ? 1 : 0,
                params.syncEnabled !== undefined ? (params.syncEnabled ? 1 : 0) : existing.sync_enabled ? 1 : 0,
                existing.id,
            ]
        );
    } else {
        await db.runAsync(
            "INSERT INTO user_profile (name, email, sync_token, ai_enabled, sync_enabled, synced) VALUES (?, ?, ?, ?, ?, 1)",
            [
                params.name,
                params.email,
                params.syncToken,
                params.aiEnabled ? 1 : 0,
                params.syncEnabled ? 1 : 0,
            ]
        );
    }
}
