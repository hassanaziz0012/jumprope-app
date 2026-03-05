import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

interface FormTextAreaProps extends TextInputProps {
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    maxLength: number;
    value: string;
}

export default function FormTextArea({ label, icon, maxLength, value, ...props }: FormTextAreaProps) {
    return (
        <View style={styles.inputGroup}>
            <View style={[styles.labelRow, { justifyContent: "space-between" }]}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {icon && <Ionicons name={icon} size={20} color="#a0a0a0" />}
                    <Text style={styles.label}>{label}</Text>
                </View>
                <Text style={styles.charCount}>
                    {value.length}/{maxLength}
                </Text>
            </View>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={value}
                maxLength={maxLength}
                placeholderTextColor="#666666"
                multiline
                textAlignVertical="top"
                {...props}
            />
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
    charCount: {
        fontSize: 12,
        color: "#666666",
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
