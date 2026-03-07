import { StyleSheet, Text, View, Pressable } from "react-native";
import { AnimatedToggle } from "../AnimatedToggle";
import { getRelativeTime } from "../../../lib/dates";

type SyncSettingsCardProps = {
    syncEnabled: boolean;
    onToggleSync: (value: boolean) => void;
    lastSync: string | null;
    onSyncNow: () => void;
    onDeleteData: () => void;
};

export function SyncSettingsCard({
    syncEnabled,
    onToggleSync,
    lastSync,
    onSyncNow,
    onDeleteData
}: SyncSettingsCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Turn On Sync</Text>
                <AnimatedToggle
                    value={syncEnabled}
                    onValueChange={onToggleSync}
                    trackColor={{ false: "#2a2a2a", true: "#ff5526" }}
                    thumbColor="#ffffff"
                />
            </View>

            <View style={styles.dateRow}>
                <Text style={styles.dateValue}>
                    Last: {lastSync ? getRelativeTime(lastSync) : "Never"}
                </Text>
            </View>

            <View style={styles.buttonGroup}>
                <Pressable style={styles.primaryButton} onPress={onSyncNow}>
                    <Text style={styles.primaryButtonText}>Sync Now</Text>
                </Pressable>
                <Pressable 
                    style={styles.secondaryButton} 
                    onPress={onDeleteData}
                >
                    <Text style={styles.secondaryButtonText}>Delete Data</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1a1a1a",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: "normal",
        color: "#ffffff",
    },
    dateRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    dateValue: {
        fontSize: 14,
        color: "#a0a0a0",
        fontWeight: "400",
    },
    buttonGroup: {
        flexDirection: "row",
        gap: 12,
    },
    primaryButton: {
        flex: 1,
        backgroundColor: "#ff5526",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "600",
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: "#2a2a2a",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        color: "#ff5526",
        fontSize: 16,
        fontWeight: "600",
    },
});
