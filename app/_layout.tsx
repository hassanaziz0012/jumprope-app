import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { initDatabase } from "../lib/database";

export default function RootLayout() {
    useEffect(() => {
        initDatabase();
    }, []);

    return (
        <>
            <StatusBar hidden />
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: "#0a0a0a",
                    },
                    headerTintColor: "#ffffff",
                    contentStyle: {
                        backgroundColor: "#0a0a0a",
                    },
                }}
            >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                    name="log-workout"
                    options={{
                        presentation: "modal",
                        headerShown: false,
                    }}
                />
            </Stack>
        </>
    );
}
