import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

interface FormInputProps extends TextInputProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
}

export default function FormInput({ icon, label, ...props }: FormInputProps) {
    return (
        <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
                <Ionicons name={icon} size={20} color="#a0a0a0" />
                <Text style={styles.label}>{label}</Text>
            </View>
            <TextInput
                style={styles.input}
                placeholderTextColor="#666666"
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
    input: {
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#ffffff",
    },
});
