import { Ionicons } from "@expo/vector-icons";
import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getUserProfile, saveUserProfile } from "../lib/database";
import { apiClient } from "../lib/apiClient";
import Button from "./components/Button";

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordStatusMsg, setPasswordStatusMsg] = useState<{
        text: string;
        type: "success" | "error";
    } | null>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const profile = await getUserProfile();
        if (profile) {
            setName(profile.name);
            setEmail(profile.email || "");
            setImageUri(profile.image);
        }
    };

    const pickImage = async () => {
        // Request permission to access media library
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            Alert.alert(
                "Permission Required",
                "Please allow access to your photo library to change your profile picture."
            );
            return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) return;

        setIsSaving(true);
        try {
            let finalImageUri = imageUri;

            if (imageUri) {
                // Check if the image needs to be moved to permanent storage
                // We do this by checking if it is already in our persistent folder
                const targetDir = new Directory(
                    Paths.document,
                    "profile_images"
                );
                if (!targetDir.exists) {
                    targetDir.create();
                }

                // If it's not in the target directory, copy it there
                // We use a simple string check for efficiency/safety, or we could compare directories
                if (!imageUri.includes(targetDir.uri)) {
                    const filename = `${Date.now()}-${Paths.basename(
                        imageUri
                    )}`;
                    const sourceFile = new File(imageUri);
                    const destFile = new File(targetDir, filename);

                    sourceFile.copy(destFile);
                    finalImageUri = destFile.uri;
                }
            }

            await saveUserProfile(
                name.trim(),
                email.trim() || undefined,
                finalImageUri || undefined
            );
            router.back();
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setPasswordStatusMsg(null);
        if (!email.trim()) {
            setPasswordStatusMsg({
                text: "Please set your email address first to change password.",
                type: "error",
            });
            return;
        }
        if (!currentPassword) {
            setPasswordStatusMsg({
                text: "Please enter your current password.",
                type: "error",
            });
            return;
        }
        if (!newPassword || newPassword.length < 8) {
            setPasswordStatusMsg({
                text: "New password must be at least 8 characters long.",
                type: "error",
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordStatusMsg({
                text: "New passwords do not match.",
                type: "error",
            });
            return;
        }

        setIsChangingPassword(true);
        try {
            await apiClient("/auth/change-password", {
                method: "POST",
                body: {
                    email: email.trim(),
                    current_password: currentPassword,
                    new_password: newPassword,
                },
                suppressToast: true,
                throwOnError: true,
            });

            setPasswordStatusMsg({
                text: "Password updated successfully!",
                type: "success",
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            const msg =
                error.data?.detail ||
                error.message ||
                "Failed to change password.";
            setPasswordStatusMsg({ text: msg, type: "error" });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
            >
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <Pressable
                        style={styles.avatarContainer}
                        onPress={pickImage}
                    >
                        {imageUri ? (
                            <Image
                                source={{ uri: imageUri }}
                                style={styles.avatar}
                            />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons
                                    name="person"
                                    size={48}
                                    color="#666666"
                                />
                            </View>
                        )}
                        <View style={styles.editAvatarBadge}>
                            <Ionicons name="camera" size={14} color="#ffffff" />
                        </View>
                    </Pressable>
                    <Text style={styles.avatarHint}>Tap to change photo</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="#666666"
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email (optional)</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            placeholderTextColor="#666666"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* Change Password Section */}
                <View style={styles.sectionHeaderContainer}>
                    <Text style={styles.sectionTitle}>Change Password</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Current Password</Text>
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Enter current password"
                                placeholderTextColor="#666666"
                                secureTextEntry={!showCurrentPassword}
                                autoCapitalize="none"
                            />
                            <Pressable
                                onPress={() =>
                                    setShowCurrentPassword(!showCurrentPassword)
                                }
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={
                                        showCurrentPassword ? "eye-off" : "eye"
                                    }
                                    size={20}
                                    color="#666666"
                                />
                            </Pressable>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Enter new password (min 8 chars)"
                                placeholderTextColor="#666666"
                                secureTextEntry={!showNewPassword}
                                autoCapitalize="none"
                            />
                            <Pressable
                                onPress={() =>
                                    setShowNewPassword(!showNewPassword)
                                }
                                style={styles.eyeIcon}
                            >
                                <Ionicons
                                    name={showNewPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color="#666666"
                                />
                            </Pressable>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm New Password</Text>
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm new password"
                                placeholderTextColor="#666666"
                                secureTextEntry={!showNewPassword}
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {passwordStatusMsg && (
                        <Text
                            style={[
                                styles.statusText,
                                passwordStatusMsg.type === "success"
                                    ? styles.statusSuccess
                                    : styles.statusError,
                            ]}
                        >
                            {passwordStatusMsg.text}
                        </Text>
                    )}

                    <Button
                        title={
                            isChangingPassword
                                ? "Updating Password..."
                                : "Update Password"
                        }
                        onPress={handleChangePassword}
                        disabled={
                            !currentPassword ||
                            !newPassword ||
                            !confirmPassword ||
                            isChangingPassword
                        }
                    />
                </View>
            </ScrollView>

            {/* Save Button */}
            <View
                style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}
            >
                <Button
                    title={isSaving ? "Saving..." : "Save"}
                    onPress={handleSave}
                    disabled={!name.trim() || isSaving}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    avatarSection: {
        alignItems: "center",
        marginVertical: 32,
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#2a2a2a",
        alignItems: "center",
        justifyContent: "center",
    },
    editAvatarBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#ff5526",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#0a0a0a",
    },
    avatarHint: {
        fontSize: 14,
        color: "#666666",
        marginTop: 12,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#a0a0a0",
    },
    input: {
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#ffffff",
    },
    sectionHeaderContainer: {
        marginTop: 32,
        marginBottom: 16,
        borderTopWidth: 1,
        borderTopColor: "#1a1a1a",
        paddingTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
    },
    passwordInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: "#ffffff",
    },
    eyeIcon: {
        padding: 4,
    },
    statusText: {
        fontSize: 14,
        marginTop: 4,
    },
    statusSuccess: {
        color: "#4cd964",
    },
    statusError: {
        color: "#ff3b30",
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#1a1a1a",
    },
});

