import Constants from "expo-constants";
import { Platform } from "react-native";

export const LIMITS = {
    AI_CHAT_MESSAGES: 10,
};

const getApiUrl = (): string => {
    // 1. Check if user configured an explicit API URL via environment variable
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // 2. Try to dynamically resolve the API URL based on Metro host
    const hostUri = Constants.expoConfig?.hostUri;

    if (hostUri) {
        // hostUri can be "192.168.1.100:8081", "127.0.0.1:8081", or a tunnel like "*.exp.direct"
        const hostname = hostUri.split(":")[0];

        // If it's not a tunnel URL, we can use the hostname directly with port 8000
        const isTunnel = hostname.includes("exp.direct") || hostname.includes("ngrok");
        if (!isTunnel) {
            // If hostname is localhost/127.0.0.1 on Android, map it to 10.0.2.2
            if (Platform.OS === "android" && (hostname === "localhost" || hostname === "127.0.0.1")) {
                return "http://10.0.2.2:8000";
            }
            return `http://${hostname}:8000`;
        }
    }

    // 3. Fallback for emulator / simulator / local development when hostUri is not available or is a tunnel
    if (Platform.OS === "android") {
        return "http://10.0.2.2:8000";
    }

    return "http://127.0.0.1:8000";
};

export const API_URL = getApiUrl();

