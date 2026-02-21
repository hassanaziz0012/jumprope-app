import { registerWidgetTaskHandler } from "react-native-android-widget";
import { LogWorkoutWidget } from "./components/LogWorkoutWidget";

/**
 * Widget Task Handler
 *
 * This is the entry point Android calls when a widget needs to be rendered.
 * It runs as a "headless" task (no UI thread) and must call renderWidget()
 * to provide the widget content.
 *
 * Widget Actions:
 * - WIDGET_ADDED: User just added the widget to home screen
 * - WIDGET_UPDATE: Periodic update or manual refresh
 * - WIDGET_RESIZED: User resized the widget
 * - WIDGET_DELETED: User removed the widget
 * - WIDGET_CLICK: User tapped on a widget area with custom clickAction
 */
registerWidgetTaskHandler(async ({ widgetAction, renderWidget }) => {
    switch (widgetAction) {
        case "WIDGET_ADDED":
        case "WIDGET_UPDATE":
        case "WIDGET_RESIZED":
            // Render the widget whenever it needs to be displayed
            renderWidget(<LogWorkoutWidget />);
            break;

        case "WIDGET_DELETED":
            // Widget was removed - cleanup if needed
            // For a static widget like ours, nothing to clean up
            break;

        case "WIDGET_CLICK":
            // Custom click actions would be handled here
            // We use OPEN_URI instead, so this won't be called for taps
            break;

        default:
            console.log(`Unknown widget action: ${widgetAction}`);
    }
});
