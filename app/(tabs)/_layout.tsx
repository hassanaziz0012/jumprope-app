import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { getUserProfile } from "../../lib/database";

export default function TabLayout() {
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const checkProfile = async () => {
            try {
                // Short wait to ensure RootLayout's initDatabase() queues its execAsync first
                await new Promise(resolve => setTimeout(resolve, 500));
                const profile = await getUserProfile();

                if (isMounted && (!profile || !profile.name)) {
                    router.replace("/onboarding" as any);
                }
            } catch (error) {
                console.error("Failed to check profile for onboarding:", error);
            }
        };

        checkProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#ff5526",
                tabBarInactiveTintColor: "#666666",
                tabBarStyle: {
                    backgroundColor: "#0a0a0a",
                    borderTopColor: "#1a1a1a",
                    borderTopWidth: 1,
                },
                headerStyle: {
                    backgroundColor: "#0a0a0a",
                },
                headerTintColor: "#ffffff",
                headerTitleStyle: {
                    fontWeight: "600",
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: "History",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="time" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ai"
                options={{
                    title: "AI",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="sparkles" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
