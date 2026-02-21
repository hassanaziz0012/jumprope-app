import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
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
