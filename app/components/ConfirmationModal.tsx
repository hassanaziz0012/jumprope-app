import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";
import Button from "./Button";

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
}

export default function ConfirmationModal({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
}: ConfirmationModalProps) {
    const confirmButtonStyle: ViewStyle = StyleSheet.flatten([
        styles.button,
        isDestructive && styles.destructiveButton,
    ]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <Pressable style={styles.overlay} onPress={onCancel}>
                <Pressable
                    style={styles.modal}
                    onPress={(e) => e.stopPropagation()}
                >
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttons}>
                        <Button
                            title={cancelText}
                            onPress={onCancel}
                            variant="secondary"
                            style={styles.button}
                        />
                        <Button
                            title={confirmText}
                            onPress={onConfirm}
                            variant="primary"
                            style={confirmButtonStyle}
                        />
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    modal: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 340,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 12,
        textAlign: "center",
    },
    message: {
        fontSize: 14,
        color: "#a0a0a0",
        marginBottom: 24,
        textAlign: "center",
        lineHeight: 20,
    },
    buttons: {
        flexDirection: "row",
        gap: 12,
    },
    button: {
        flex: 1,
    },
    destructiveButton: {
        backgroundColor: "#dc3545",
    },
});
