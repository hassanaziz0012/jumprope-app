import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { initDatabase, getUserProfile } from "../lib/database";
import { scheduleStreakNotification } from "../lib/notifications";
import { SyncToast } from "./components/SyncToast";
import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { runSync } from "../lib/sync";

Sentry.init({
  dsn: 'https://375656c4b25f5166691c77cc9968565a@o4510460628828160.ingest.de.sentry.io/4510634224648272',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: "#0a0a0a",
    },
};

export default Sentry.wrap(function RootLayout() {
    useEffect(() => {
        initDatabase();
        scheduleStreakNotification();
        if (Platform.OS === 'android') {
            NavigationBar.setPositionAsync('absolute');
            NavigationBar.setVisibilityAsync('hidden');
            NavigationBar.setBehaviorAsync('overlay-swipe');
        }

        // Run sync in the background without blocking app startup
        // using setTimeout to allow the app to render and interactions to finish
        setTimeout(() => {
            runSync().catch((err) => console.error("Background sync failed:", err));
        }, 1500); // 1.5 seconds delay gives enough time for initial render
    }, []);

    return (
        <>
            <StatusBar hidden />
            <ThemeProvider value={CustomDarkTheme}>
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
                    <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                    />
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
                        name="charts"
                        options={{
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="notifications"
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
                <SyncToast />
            </ThemeProvider>
        </>
    );
});