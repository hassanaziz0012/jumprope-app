import { trackGoals } from "@/lib/goalTracking";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CreateWorkoutInput, Workout } from "../../lib/database";
import Button from "./Button";

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
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
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

    const handleDateChange = (
        event: DateTimePickerEvent,
        selectedDate?: Date
    ) => {
        setShowDatePicker(false);
        if (event.type === "set" && selectedDate) {
            const newDate = workoutDate
                ? new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate(),
                      workoutDate.getHours(),
                      workoutDate.getMinutes()
                  )
                : selectedDate;
            setWorkoutDate(newDate);
        }
    };

    const handleTimeChange = (
        event: DateTimePickerEvent,
        selectedTime?: Date
    ) => {
        setShowTimePicker(false);
        if (event.type === "set" && selectedTime) {
            const baseDate = workoutDate || new Date();
            const newDate = new Date(
                baseDate.getFullYear(),
                baseDate.getMonth(),
                baseDate.getDate(),
                selectedTime.getHours(),
                selectedTime.getMinutes()
            );
            setWorkoutDate(newDate);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

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
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Ionicons
                                name="calendar-outline"
                                size={20}
                                color="#a0a0a0"
                            />
                            <Text style={styles.label}>
                                Date & Time (optional)
                            </Text>
                        </View>
                        <View style={styles.dateTimeRow}>
                            <Pressable
                                style={styles.dateTimeButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons
                                    name="calendar"
                                    size={18}
                                    color="#a0a0a0"
                                />
                                <Text style={styles.dateTimeButtonText}>
                                    {workoutDate
                                        ? formatDate(workoutDate)
                                        : "Today"}
                                </Text>
                            </Pressable>
                            <Pressable
                                style={styles.dateTimeButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Ionicons
                                    name="time"
                                    size={18}
                                    color="#a0a0a0"
                                />
                                <Text style={styles.dateTimeButtonText}>
                                    {workoutDate
                                        ? formatTime(workoutDate)
                                        : "Now"}
                                </Text>
                            </Pressable>
                        </View>
                        {showDatePicker && (
                            <DateTimePicker
                                value={workoutDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                            />
                        )}
                        {showTimePicker && (
                            <DateTimePicker
                                value={workoutDate || new Date()}
                                mode="time"
                                display="default"
                                onChange={handleTimeChange}
                            />
                        )}
                    </View>

                    {/* Duration */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Ionicons
                                name="time-outline"
                                size={20}
                                color="#a0a0a0"
                            />
                            <Text style={styles.label}>Duration</Text>
                        </View>
                        <View style={styles.durationRow}>
                            <View style={styles.durationInputWrapper}>
                                <TextInput
                                    style={styles.durationInput}
                                    value={durationMinutes}
                                    onChangeText={setDurationMinutes}
                                    placeholder="0"
                                    placeholderTextColor="#666666"
                                    keyboardType="numeric"
                                    maxLength={3}
                                />
                                <Text style={styles.durationLabel}>min</Text>
                            </View>
                            <View style={styles.durationInputWrapper}>
                                <TextInput
                                    style={styles.durationInput}
                                    value={durationSeconds}
                                    onChangeText={setDurationSeconds}
                                    placeholder="0"
                                    placeholderTextColor="#666666"
                                    keyboardType="numeric"
                                    maxLength={2}
                                />
                                <Text style={styles.durationLabel}>sec</Text>
                            </View>
                        </View>
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

                    {/* Avg Skips per Minute */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Ionicons
                                name="speedometer-outline"
                                size={20}
                                color="#a0a0a0"
                            />
                            <Text style={styles.label}>
                                Avg Skips/min (optional)
                            </Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={avgSkipsPerMinute}
                            onChangeText={setAvgSkipsPerMinute}
                            placeholder="Auto-calculated if blank"
                            placeholderTextColor="#666666"
                            keyboardType="decimal-pad"
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

                    {/* Avg Heart Rate */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Ionicons
                                name="heart-outline"
                                size={20}
                                color="#a0a0a0"
                            />
                            <Text style={styles.label}>
                                Avg Heart Rate - BPM (optional)
                            </Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={avgHeartRate}
                            onChangeText={setAvgHeartRate}
                            placeholder="e.g. 130"
                            placeholderTextColor="#666666"
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Max Heart Rate */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelRow}>
                            <Ionicons name="heart" size={20} color="#a0a0a0" />
                            <Text style={styles.label}>
                                Max Heart Rate - BPM (optional)
                            </Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            value={maxHeartRate}
                            onChangeText={setMaxHeartRate}
                            placeholder="e.g. 165"
                            placeholderTextColor="#666666"
                            keyboardType="numeric"
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
    durationRow: {
        flexDirection: "row",
        gap: 16,
    },
    durationInputWrapper: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    durationInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: "#ffffff",
    },
    durationLabel: {
        fontSize: 14,
        color: "#a0a0a0",
        marginLeft: 8,
    },
    dateTimeRow: {
        flexDirection: "row",
        gap: 12,
    },
    dateTimeButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
    },
    dateTimeButtonText: {
        fontSize: 14,
        color: "#ffffff",
    },
});
