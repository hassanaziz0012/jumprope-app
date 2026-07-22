import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { initDatabase } from "../lib/database";
import { scheduleStreakNotification, scheduleWeeklyDigestNotification } from "../lib/notifications";
import { SyncToast } from "./components/SyncToast";
import { ApiToast } from "./components/ApiToast";
import * as Sentry from '@sentry/react-native';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { runSync } from "../lib/sync";
import * as Notifications from "expo-notifications";

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
    const router = useRouter();
    const notificationResponseListener = useRef<Notifications.EventSubscription | null>(null);

    useEffect(() => {
        initDatabase();
        scheduleStreakNotification();
        scheduleWeeklyDigestNotification();
        
        // Hide status bar natively at runtime
        RNStatusBar.setHidden(true, 'none');

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

        // Handle notification tap: navigate to the URL if provided in notification data
        notificationResponseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const url = response.notification.request.content.data?.url;
            if (url && typeof url === "string") {
                router.push(url as any);
            }
        });

        return () => {
            notificationResponseListener.current?.remove();
        };
    }, []);

    return (
        <>
            <StatusBar hidden={true} />
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
                        name="onboarding"
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
                        name="models-and-api-keys"
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
                    <Stack.Screen
                        name="digest-display"
                        options={{
                            headerShown: false,
                        }}
                    />
                </Stack>
                <SyncToast />
            </ThemeProvider>
        </>
    );
});