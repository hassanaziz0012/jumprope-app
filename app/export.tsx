import Button from "@/app/components/Button";
import { getAllWorkouts } from "@/lib/database";
import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ExportScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        router.back();
    };

    const handleExportCSV = async () => {
        try {
            setLoading(true);
            const workouts = await getAllWorkouts();

            if (workouts.length === 0) {
                Alert.alert("No Data", "There are no workouts to export.");
                setLoading(false);
                return;
            }

            // Create CSV header
            const header =
                "Date,Duration (s),Total Skips,Avg Skips/Min,Trips,Calories,Avg Heart Rate,Max Heart Rate,Notes\n";

            // Create CSV rows
            const rows = workouts
                .map((w) => {
                    const date = new Date(w.date).toISOString();
                    const notes = w.notes
                        ? `"${w.notes.replace(/"/g, '""')}"`
                        : ""; // Escape quotes in notes
                    return `${date},${w.duration},${w.total_skips},${
                        w.avg_skips_per_minute
                    },${w.trips},${w.calories || ""},${
                        w.heart_rate_avg || ""
                    },${w.heart_rate_max || ""},${notes}`;
                })
                .join("\n");

            const csvContent = header + rows;
            const filename = `jumprope_workouts_${
                new Date().toISOString().split("T")[0]
            }.csv`;

            const file = new File(Paths.cache, filename);
            try {
                file.create();
            } catch {
                // Ignore if file already exists
            }
            file.write(csvContent);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri);
            } else {
                Alert.alert("Error", "Sharing is not available on this device");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to export CSV file.");
        } finally {
            setLoading(false);
        }
    };

    const handleExportJSON = async () => {
        try {
            setLoading(true);
            const workouts = await getAllWorkouts();

            if (workouts.length === 0) {
                Alert.alert("No Data", "There are no workouts to export.");
                setLoading(false);
                return;
            }

            const jsonContent = JSON.stringify(workouts, null, 2);
            const filename = `jumprope_workouts_${
                new Date().toISOString().split("T")[0]
            }.json`;

            const file = new File(Paths.cache, filename);
            try {
                file.create();
            } catch {
                // Ignore if file already exists
            }
            file.write(jsonContent);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(file.uri);
            } else {
                Alert.alert("Error", "Sharing is not available on this device");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to export JSON file.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.headerTitle}>Export Data</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.infoContainer}>
                    <Text style={styles.description}>
                        Export your entire workout history to backup your data
                        or analyze it using other tools.
                    </Text>
                </View>

                <View style={styles.actionsContainer}>
                    <Button
                        title="Export CSV"
                        onPress={handleExportCSV}
                        icon="document-text-outline"
                        style={styles.button}
                        disabled={loading}
                    />

                    <View style={styles.spacer} />

                    <Button
                        title="Export JSON"
                        onPress={handleExportJSON}
                        icon="code-slash-outline"
                        variant="secondary"
                        style={styles.button}
                        disabled={loading}
                    />
                </View>

                {loading && (
                    <Text style={styles.loadingText}>Preparing export...</Text>
                )}
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
        borderRadius: 20,
        backgroundColor: "#1a1a1a",
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
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    infoContainer: {
        marginBottom: 32,
    },
    description: {
        fontSize: 16,
        color: "#a0a0a0",
        lineHeight: 24,
        textAlign: "center",
    },
    actionsContainer: {
        width: "100%",
    },
    button: {
        width: "100%",
    },
    spacer: {
        height: 16,
    },
    loadingText: {
        marginTop: 24,
        color: "#666666",
        textAlign: "center",
        fontSize: 14,
    },
});
