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
                <Stack.Screen
                    name="profile"
                    options={{
                        presentation: "modal",
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="goals"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="export"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="streak-history"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="workout/[id]"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="workout/edit"
                    options={{
                        presentation: "modal",
                        headerShown: false,
                    }}
                />
            </Stack>
        </>
    );
}
