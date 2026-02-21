import React from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
    ScrollView,
} from "react-native";
import Button from "./Button";
import { Ionicons } from "@expo/vector-icons";

interface AIConsentModalProps {
    visible: boolean;
    onConsent: () => void;
    onCancel: () => void;
}

export default function AIConsentModal({
    visible,
    onConsent,
    onCancel,
}: AIConsentModalProps) {
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
                    <View style={styles.iconContainer}>
                        <Ionicons name="sparkles" size={32} color="#ccfa53" />
                    </View>
                    <Text style={styles.title}>Enable AI Features</Text>
                    <ScrollView style={styles.messageScroll}>
                        <Text style={styles.message}>
                            AI features are completely optional. If you do
                            decide to use the AI coach, your workout training
                            data and history will be sent to Gemini servers.
                        </Text>
                        <Text style={styles.message}>
                            If you consent to this then enable AI; otherwise the
                            base app features will work offline and locally
                            regardless of whether you use AI or not.
                        </Text>
                    </ScrollView>
                    <View style={styles.buttons}>
                        <Button
                            title="Cancel"
                            onPress={onCancel}
                            variant="secondary"
                            style={styles.button}
                        />
                        <Button
                            title="I Consent"
                            onPress={onConsent}
                            variant="primary"
                            style={styles.button}
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
        borderRadius: 20,
        padding: 24,
        width: "100%",
        maxWidth: 340,
        alignItems: "center",
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(204, 250, 83, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 16,
        textAlign: "center",
    },
    messageScroll: {
        maxHeight: 200,
        marginBottom: 24,
    },
    message: {
        fontSize: 15,
        color: "#a0a0a0",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 12,
    },
    buttons: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    button: {
        flex: 1,
    },
});
