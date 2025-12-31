import { useRouter } from "expo-router";
import { createWorkout } from "../lib/database";
import WorkoutForm from "./components/WorkoutForm";

export default function LogWorkoutScreen() {
    const router = useRouter();

    const handleSubmit = async (data: Parameters<typeof createWorkout>[0]) => {
        await createWorkout(data);
        router.back();
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <WorkoutForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            title="Log Workout"
            submitLabel="Save"
        />
    );
}
