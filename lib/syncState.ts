type SyncStateListener = (isSyncing: boolean, message?: string) => void;
const listeners = new Set<SyncStateListener>();

export let isSyncing = false;
export let syncMessage = "";

export function subscribeToSyncState(listener: SyncStateListener) {
    listeners.add(listener);
    listener(isSyncing, syncMessage);
    return () => {
        listeners.delete(listener);
    };
}

export function setSyncState(syncing: boolean, message: string = "") {
    isSyncing = syncing;
    syncMessage = message;
    listeners.forEach((l) => l(isSyncing, syncMessage));
}
