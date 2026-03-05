import { Ionicons } from "@expo/vector-icons";
import { Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { aboutLinks } from "../../../lib/social";

interface AboutModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function AboutModal({ visible, onClose }: AboutModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.modalOverlay}
                onPress={onClose}
            >
                <View style={styles.modalContent}>
                    <Ionicons name="fitness" size={48} color="#ccfa53" />
                    <Text style={styles.modalTitle}>Jumprope Tracker</Text>
                    <Text style={styles.modalVersion}>Version 1.0.0</Text>
                    <Text style={styles.modalSubtitle}>
                        Track your jump rope workouts and improve your
                        fitness!
                    </Text>
                    <Text style={styles.modalSubtitle}>
                        I made this for tracking my own jumprope workouts.
                        If this helps you, you can learn more about me and
                        my work from any of the following links.
                    </Text>
                    <View style={styles.socialRow}>
                        {[
                            {
                                icon: "logo-twitter",
                                url: aboutLinks.twitter,
                            },
                            {
                                icon: "logo-youtube",
                                url: aboutLinks.youtube,
                            },
                            {
                                icon: "logo-github",
                                url: aboutLinks.github,
                            },
                            {
                                icon: "globe-outline",
                                url: aboutLinks.website,
                            },
                        ].map((item, index) => (
                            <Pressable
                                key={index}
                                style={styles.socialButton}
                                onPress={() => Linking.openURL(item.url)}
                            >
                                <Ionicons
                                    name={item.icon as any}
                                    size={24}
                                    color="#ccfa53"
                                />
                            </Pressable>
                        ))}
                    </View>

                    <Pressable
                        style={styles.modalCloseButton}
                        onPress={onClose}
                    >
                        <Text style={styles.modalCloseText}>Close</Text>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    modalContent: {
        backgroundColor: "#1a1a1a",
        borderRadius: 20,
        padding: 32,
        width: "100%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#ffffff",
        marginTop: 16,
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 16,
        color: "#a0a0a0",
        textAlign: "center",
        marginBottom: 8,
    },
    modalVersion: {
        fontSize: 14,
        color: "#666666",
        marginBottom: 24,
    },
    modalCloseButton: {
        backgroundColor: "#2a2a2a",
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
    socialRow: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 24,
        marginTop: 16,
    },
    socialButton: {
        backgroundColor: "#2a2a2a",
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
});
