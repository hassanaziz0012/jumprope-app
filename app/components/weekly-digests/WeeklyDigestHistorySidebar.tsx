import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getUserProfile } from "../../../lib/models/userProfile";
import { API_URL } from "../../../lib/constants";

interface WeeklyDigest {
    created_at: string;
    digest: string;
}

interface GroupedDigests {
    title: string;
    data: WeeklyDigest[];
}

interface WeeklyDigestHistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const { width } = Dimensions.get("window");
const SIDEBAR_WIDTH = Math.min(width * 0.8, 320);

export default function WeeklyDigestHistorySidebar({ isOpen, onClose }: WeeklyDigestHistorySidebarProps) {
    const [slideAnim] = useState(new Animated.Value(SIDEBAR_WIDTH));
    const [loading, setLoading] = useState(false);
    const [digests, setDigests] = useState<WeeklyDigest[]>([]);
    const [groupedDigests, setGroupedDigests] = useState<GroupedDigests[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
            fetchDigests();
        } else {
            Animated.timing(slideAnim, {
                toValue: SIDEBAR_WIDTH,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isOpen]);

    const fetchDigests = async () => {
        setLoading(true);
        try {
            const profile = await getUserProfile();
            if (!profile?.sync_token) {
                console.error("No sync token found for user");
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/weekly-digests?sync_token=${profile.sync_token}`);

            if (!response.ok) {
                console.error("Failed to fetch weekly digests", response.status);
                setLoading(false);
                return;
            }
            const data: WeeklyDigest[] = await response.json();
            setDigests(data);
            groupDigestsByMonth(data);
        } catch (error) {
            console.error("Error fetching weekly digests:", error);
        } finally {
            setLoading(false);
        }
    };

    const groupDigestsByMonth = (digestsList: WeeklyDigest[]) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const groups: Record<string, WeeklyDigest[]> = {};

        digestsList.forEach(digest => {
            const date = new Date(digest.created_at);
            const key = `${months[date.getMonth()]}, ${date.getFullYear()}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(digest);
        });

        // Sort groups by date (most recent first) and items within groups
        const groupedArray = Object.keys(groups)
            .sort((a, b) => {
                const dateA = new Date(groups[a][0].created_at);
                const dateB = new Date(groups[b][0].created_at);
                return dateB.getTime() - dateA.getTime();
            })
            .map(key => ({
                title: key,
                data: groups[key].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ),
            }));

        setGroupedDigests(groupedArray);
    };

    const handleSelect = (digest: WeeklyDigest) => {
        onClose();
        router.push({
            pathname: "/digest-display",
            params: { digest: digest.digest, date: digest.created_at },
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    const getDigestPreview = (digest: string) => {
        // Strip markdown and get first ~80 chars
        const stripped = digest
            .replace(/#{1,6}\s/g, "")
            .replace(/\*{1,2}(.*?)\*{1,2}/g, "$1")
            .replace(/\n/g, " ")
            .trim();
        return stripped.length > 80 ? stripped.substring(0, 80) + "…" : stripped;
    };

    // @ts-ignore - internal animated value access for performance optimization
    if (!isOpen && (slideAnim as any)._value === SIDEBAR_WIDTH) {
        return null;
    }

    return (
        <View style={[StyleSheet.absoluteFill, styles.overlayWrapper]} pointerEvents={isOpen ? "auto" : "none"}>
            {/* Backdrop */}
            {isOpen && (
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
            )}

            {/* Sidebar - slides from right */}
            <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Past Digests</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#a0a0a0" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#ff5526" />
                        <Text style={styles.loadingText}>Loading digests...</Text>
                    </View>
                ) : (
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                        {groupedDigests.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="document-text-outline" size={48} color="#333" />
                                <Text style={styles.emptyText}>No past digests found.</Text>
                            </View>
                        ) : (
                            groupedDigests.map((group) => (
                                <View key={group.title} style={styles.groupContainer}>
                                    <Text style={styles.groupTitle}>{group.title}</Text>
                                    {group.data.map((digest, index) => (
                                        <TouchableOpacity
                                            key={`${digest.created_at}-${index}`}
                                            style={styles.digestItem}
                                            onPress={() => handleSelect(digest)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="document-text-outline" size={18} color="#a0a0a0" style={styles.digestIcon} />
                                            <View style={styles.digestInfo}>
                                                <Text style={styles.digestDate}>{formatDate(digest.created_at)}</Text>
                                                <Text style={styles.digestPreview} numberOfLines={1}>
                                                    {getDigestPreview(digest.digest)}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ))
                        )}
                    </ScrollView>
                )}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlayWrapper: {
        zIndex: 100,
        elevation: 10,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    sidebar: {
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        width: SIDEBAR_WIDTH,
        backgroundColor: "#1a1a1a",
        borderLeftWidth: 1,
        borderLeftColor: "rgba(255, 255, 255, 0.05)",
        shadowColor: "#000",
        shadowOffset: { width: -4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.05)",
    },
    headerTitle: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "700",
    },
    closeButton: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        color: "#a0a0a0",
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        marginTop: 100,
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.6,
    },
    emptyText: {
        marginTop: 16,
        color: "#a0a0a0",
        fontSize: 14,
        textAlign: "center",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    groupContainer: {
        marginBottom: 24,
    },
    groupTitle: {
        color: "#ff5526",
        fontSize: 12,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 12,
        marginLeft: 8,
    },
    digestItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.02)",
        marginBottom: 8,
    },
    digestIcon: {
        marginRight: 12,
    },
    digestInfo: {
        flex: 1,
    },
    digestDate: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 2,
    },
    digestPreview: {
        color: "#a0a0a0",
        fontSize: 13,
    },
});
