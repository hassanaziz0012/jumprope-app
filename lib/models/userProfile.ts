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
    } else {
        await db.runAsync(
            "INSERT INTO user_profile (name, email, image, ai_enabled, ai_provider, api_key, ai_model, sync_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                name,
                email ?? null,
                image ?? null,
                aiEnabled ? 1 : 0,
                aiProvider ?? null,
                apiKey ?? null,
                aiModel ?? null,
                Crypto.randomUUID()
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
    } else {
        await db.runAsync(
            "INSERT INTO user_profile (name, sync_enabled, sync_token) VALUES (?, ?, ?)",
            ["User", enabled ? 1 : 0, Crypto.randomUUID()]
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
