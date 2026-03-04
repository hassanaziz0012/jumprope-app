export const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds} seconds`;
    if (remainingSeconds === 0)
        return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    return `${minutes}m ${remainingSeconds}s`;
};