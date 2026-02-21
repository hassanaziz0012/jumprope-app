import {
    FlexWidget,
    TextWidget,
    IconWidget,
} from "react-native-android-widget";

/**
 * LogWorkoutWidget - Android home screen widget
 *
 * This widget displays a tappable button that opens the log workout form.
 * It uses special widget components (FlexWidget, TextWidget, IconWidget)
 * that translate to Android RemoteViews - regular React Native components
 * like View and Text won't work in widgets.
 */
export function LogWorkoutWidget() {
    return (
        <FlexWidget
            style={{
                height: "match_parent",
                width: "match_parent",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#1a1a2e",
                borderRadius: 16,
                padding: 12,
            }}
            // OPEN_URI deep links to the log workout page in the app
            clickAction="OPEN_URI"
            clickActionData={{ uri: "jumprope-app://log-workout" }}
            accessibilityLabel="Log a workout"
        >
            {/* Plus icon */}
            <IconWidget
                font="material"
                icon="add_circle"
                size={28}
                style={{
                    color: "#4ade80",
                    marginRight: 8,
                }}
            />
            {/* Widget label */}
            <TextWidget
                text="Log Workout"
                style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#ffffff",
                }}
            />
        </FlexWidget>
    );
}
