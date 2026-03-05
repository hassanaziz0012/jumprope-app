import { trackGoals } from "@/lib/goalTracking";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CreateWorkoutInput, Workout } from "../../lib/database";
import Button from "./Button";
import FormInput from "./form/FormInput";
import FormTextArea from "./form/FormTextArea";
import FormDurationInput from "./form/FormDurationInput";
import FormDateTimePicker from "./form/FormDateTimePicker";

interface WorkoutFormProps {
    initialData?: Workout;
    onSubmit: (data: CreateWorkoutInput) => Promise<void>;
    onCancel: () => void;
    submitLabel?: string;
    title?: string;
}

export default function WorkoutForm({
    initialData,
    onSubmit,
    onCancel,
    submitLabel = "Save",
    title = "Log Workout",
}: WorkoutFormProps) {
    const insets = useSafeAreaInsets();
    const [workoutDate, setWorkoutDate] = useState<Date | null>(null);
    const [durationMinutes, setDurationMinutes] = useState("");
    const [durationSeconds, setDurationSeconds] = useState("");
    const [totalSkips, setTotalSkips] = useState("");
    const [avgSkipsPerMinute, setAvgSkipsPerMinute] = useState("");
    const [trips, setTrips] = useState("");
    const [calories, setCalories] = useState("");
    const [avgHeartRate, setAvgHeartRate] = useState("");
    const [maxHeartRate, setMaxHeartRate] = useState("");
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // Pre-fill form data when initialData is provided
    useEffect(() => {
        if (initialData) {
            setWorkoutDate(new Date(initialData.date));
            setDurationMinutes(
                Math.floor(initialData.duration / 60).toString()
            );
            setDurationSeconds((initialData.duration % 60).toString());
            setTotalSkips(initialData.total_skips.toString());
            setAvgSkipsPerMinute(
                initialData.avg_skips_per_minute?.toString() || ""
            );
            setTrips(initialData.trips.toString());
            setCalories(initialData.calories?.toString() || "");
            setAvgHeartRate(initialData.heart_rate_avg?.toString() || "");
            setMaxHeartRate(initialData.heart_rate_max?.toString() || "");
            setNotes(initialData.notes || "");
        }
    }, [initialData]);

    const getTotalDurationSeconds = () => {
        const mins = parseInt(durationMinutes, 10) || 0;
        const secs = parseInt(durationSeconds, 10) || 0;
        return mins * 60 + secs;
    };

    const handleSave = async () => {
        const totalDuration = getTotalDurationSeconds();
        if (totalDuration <= 0 || !totalSkips) {
            return;
        }

        setIsSaving(true);
        try {
            const dateToSave =
                workoutDate?.toISOString() ?? new Date().toISOString();
            await onSubmit({
                date: dateToSave,
                duration: totalDuration,
                totalSkips: parseInt(totalSkips, 10),
                avgSkipsPerMinute: avgSkipsPerMinute
                    ? parseFloat(avgSkipsPerMinute)
                    : undefined,
                trips: trips ? parseInt(trips, 10) : 0,
                calories: calories ? parseFloat(calories) : undefined,
                heartRateAvg: avgHeartRate
                    ? parseInt(avgHeartRate, 10)
                    : undefined,
                heartRateMax: maxHeartRate
                    ? parseInt(maxHeartRate, 10)
                    : undefined,
                notes: notes || undefined,
            });

            // Track goals after successful save
            try {
                // We await this to ensure logging happens, but since it's local DB it's fast.
                await trackGoals(dateToSave);
            } catch (e) {
                console.error("Failed to track goals:", e);
            }
        } catch (error) {
            console.error("Failed to save workout:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Button title="Cancel" onPress={onCancel} variant="ghost" />
                    <Text style={styles.title}>{title}</Text>
                    <Button
                        title={submitLabel}
                        onPress={handleSave}
                        variant="ghost"
                        disabled={
                            getTotalDurationSeconds() <= 0 ||
                            !totalSkips ||
                            isSaving
                        }
                    />
                </View>

                <ScrollView
                    style={styles.form}
                    contentContainerStyle={styles.formContent}
                >
                    {/* Date & Time */}
                    <FormDateTimePicker
                        workoutDate={workoutDate}
                        setWorkoutDate={setWorkoutDate}
                    />

                    {/* Duration */}
                    <FormDurationInput
                        durationMinutes={durationMinutes}
                        setDurationMinutes={setDurationMinutes}
                        durationSeconds={durationSeconds}
                        setDurationSeconds={setDurationSeconds}
                    />

                    {/* Total Skips */}
                    <FormInput
                        icon="fitness-outline"
                        label="Total Skips"
                        value={totalSkips}
                        onChangeText={setTotalSkips}
                        placeholder="e.g. 500"
                        keyboardType="numeric"
                    />

                    {/* Trips */}
                    <FormInput
                        icon="alert-circle-outline"
                        label="Trips (interruptions)"
                        value={trips}
                        onChangeText={setTrips}
                        placeholder="e.g. 3"
                        keyboardType="numeric"
                    />

                    {/* Avg Skips per Minute */}
                    <FormInput
                        icon="speedometer-outline"
                        label="Avg Skips/min (optional)"
                        value={avgSkipsPerMinute}
                        onChangeText={setAvgSkipsPerMinute}
                        placeholder="Auto-calculated if blank"
                        keyboardType="decimal-pad"
                    />

                    {/* Calories */}
                    <FormInput
                        icon="flame-outline"
                        label="Calories (optional)"
                        value={calories}
                        onChangeText={setCalories}
                        placeholder="e.g. 150"
                        keyboardType="decimal-pad"
                    />

                    {/* Avg Heart Rate */}
                    <FormInput
                        icon="heart-outline"
                        label="Avg Heart Rate - BPM (optional)"
                        value={avgHeartRate}
                        onChangeText={setAvgHeartRate}
                        placeholder="e.g. 130"
                        keyboardType="numeric"
                    />

                    {/* Max Heart Rate */}
                    <FormInput
                        icon="heart"
                        label="Max Heart Rate - BPM (optional)"
                        value={maxHeartRate}
                        onChangeText={setMaxHeartRate}
                        placeholder="e.g. 165"
                        keyboardType="numeric"
                    />

                    {/* Notes */}
                    <FormTextArea
                        icon="document-text-outline"
                        label="Notes (optional)"
                        value={notes}
                        onChangeText={setNotes}
                        maxLength={500}
                        placeholder="How was your workout?"
                    />
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
});
