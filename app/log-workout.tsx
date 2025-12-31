import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createWorkout } from "../lib/database";
import Button from "./components/Button";

export default function LogWorkoutScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [duration, setDuration] = useState("");
    const [totalSkips, setTotalSkips] = useState("");
    const [trips, setTrips] = useState("");
    const [calories, setCalories] = useState("");
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!duration || !totalSkips) {
            return; // Basic validation
        }

        setIsSaving(true);
        try {
            await createWorkout({
                duration: parseInt(duration, 10) * 60, // Convert minutes to seconds
                totalSkips: parseInt(totalSkips, 10),
                trips: trips ? parseInt(trips, 10) : 0,
                calories: calories ? parseFloat(calories) : undefined,
                notes: notes || undefined,
            });
            router.back();
        } catch (error) {
            console.error("Failed to save workout:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Button
                        title="Cancel"
                        onPress={handleCancel}
                        variant="ghost"
                    />
                    <Text style={styles.title}>Log Workout</Text>
                    <Button
                        title="Save"
                        onPress={handleSave}
                        variant="ghost"
                        disabled={!duration || !totalSkips || isSaving}
                    />
                </View>

                <ScrollView
                    style={styles.form}
                    contentContainerStyle={styles.formContent}
                >
                    {/* Duration */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Ionicons
                                name="time-outline"
                                size={20}
                                color="#a0a0a0"
                            />
                            <Text style={styles.label}>Duration (minutes)</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={duration}
                            onChangeText={setDuration}
                            placeholder="e.g. 15"
                            placeholderTextColor="#666666"
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Total Skips */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Ionicons
                                name="fitness-outline"
                                size={20}
                                color="#a0a0a0"
                            />
                            <Text style={styles.label}>Total Skips</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={totalSkips}
                            onChangeText={setTotalSkips}
                            placeholder="e.g. 500"
                            placeholderTextColor="#666666"
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Trips */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Ionicons
                                name="alert-circle-outline"
                                size={20}
                                color="#a0a0a0"
                            />
                            <Text style={styles.label}>
                                Trips (interruptions)
                            </Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={trips}
                            onChangeText={setTrips}
                            placeholder="e.g. 3"
                            placeholderTextColor="#666666"
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Calories */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Ionicons
                                name="flame-outline"
                                size={20}
                                color="#a0a0a0"
                            />
                            <Text style={styles.label}>
                                Calories (optional)
                            </Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={calories}
                            onChangeText={setCalories}
                            placeholder="e.g. 150"
                            placeholderTextColor="#666666"
                            keyboardType="decimal-pad"
                        />
                    </View>

                    {/* Notes */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Ionicons
                                name="document-text-outline"
                                size={20}
                                color="#a0a0a0"
                            />
                            <Text style={styles.label}>Notes (optional)</Text>
                        </View>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={notes}
                            onChangeText={setNotes}
                            placeholder="How was your workout?"
                            placeholderTextColor="#666666"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#1a1a1a",
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
    },
    form: {
        flex: 1,
    },
    formContent: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#a0a0a0",
        marginLeft: 8,
    },
    input: {
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#ffffff",
    },
    textArea: {
        minHeight: 100,
        paddingTop: 14,
    },
});
