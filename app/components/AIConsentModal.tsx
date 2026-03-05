import React, { useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
    ScrollView,
    Linking,
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
    const [agreedApp, setAgreedApp] = useState(false);
    const [agreedGoogle, setAgreedGoogle] = useState(false);

    const handleConsent = () => {
        if (agreedApp && agreedGoogle) {
            onConsent();
        }
    };
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
                            data and history will be sent to Google servers so you can use Google Gemini to provide AI features.
                        </Text>
                        <Text style={styles.message}>
                            If you consent to this then enable AI; otherwise the
                            base app features will work offline and locally
                            regardless of whether you use AI or not.
                        </Text>
                        <Pressable onPress={() => Linking.openURL('https://ai.google.dev/gemini-api/terms')}>
                            <Text style={styles.link}>
                                Google Gemini Privacy Policy and Terms of Service
                            </Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.checkboxContainer} 
                            onPress={() => setAgreedApp(!agreedApp)}
                        >
                            <Ionicons 
                                name={agreedApp ? "checkbox" : "square-outline"} 
                                size={24} 
                                color={agreedApp ? "#ccfa53" : "#a0a0a0"} 
                            />
                            <Text style={styles.checkboxLabel}>
                                I agree to let this app process my data to enable AI features.
                            </Text>
                        </Pressable>
                        
                        <Pressable 
                            style={styles.checkboxContainer} 
                            onPress={() => setAgreedGoogle(!agreedGoogle)}
                        >
                            <Ionicons 
                                name={agreedGoogle ? "checkbox" : "square-outline"} 
                                size={24} 
                                color={agreedGoogle ? "#ccfa53" : "#a0a0a0"} 
                            />
                            <Text style={styles.checkboxLabel}>
                                I agree to let Google Gemini process my workout data to enable AI features.
                            </Text>
                        </Pressable>
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
                            onPress={handleConsent}
                            variant="primary"
                            style={styles.button}
                            disabled={!agreedApp || !agreedGoogle}
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
        maxHeight: 400,
        marginBottom: 24,
    },
    message: {
        fontSize: 15,
        color: "#a0a0a0",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 12,
    },
    link: {
        fontSize: 15,
        color: "#ccfa53",
        textAlign: "center",
        textDecorationLine: "underline",
        marginBottom: 24,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    checkboxLabel: {
        fontSize: 14,
        color: "#E0E0E0",
        marginLeft: 12,
        flex: 1,
        lineHeight: 20,
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
