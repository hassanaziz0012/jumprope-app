// Register widget task handler before the app starts
// This must be done at the entry point so the headless JS task can run
import "./app/widgetTaskHandler";

// Standard Expo Router entry point
import "expo-router/entry";
