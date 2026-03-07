import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack } from "expo-router";

export default function WeeklyDigestScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <Stack.Screen 
                options={{
                    headerShown: false,
                }} 
            />
            <Text style={styles.title}>Weekly Digest</Text>
            <View style={styles.content}>
                <Text style={styles.placeholder}>Weekly digest content goes here...</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 24,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    placeholder: {
        color: "#a0a0a0",
        fontSize: 16,
    },
});
