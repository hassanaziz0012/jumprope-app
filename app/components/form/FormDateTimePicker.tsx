import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface FormDateTimePickerProps {
    workoutDate: Date | null;
    setWorkoutDate: (date: Date) => void;
}

export default function FormDateTimePicker({ workoutDate, setWorkoutDate }: FormDateTimePickerProps) {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

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

    return (
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
    );
}

const styles = StyleSheet.create({
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
