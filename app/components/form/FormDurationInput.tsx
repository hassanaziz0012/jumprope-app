import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface FormDurationInputProps {
    durationMinutes: string;
    setDurationMinutes: (val: string) => void;
    durationSeconds: string;
    setDurationSeconds: (val: string) => void;
}

export default function FormDurationInput({
    durationMinutes,
    setDurationMinutes,
    durationSeconds,
    setDurationSeconds,
}: FormDurationInputProps) {
    return (
        <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
                <Ionicons name="time-outline" size={20} color="#a0a0a0" />
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
});
