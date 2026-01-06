export const NOTIFICATION_SOUND_URL = '/sounds/notif_v2.mp3?v=2';

// Keep track of active audio instances to prevent garbage collection
const activeAudio = new Set<HTMLAudioElement>();

export function playNotificationSound(): void {
    try {
        const audio = new Audio(NOTIFICATION_SOUND_URL);
        audio.volume = 0.5;

        // Add to set to keep reference alive
        activeAudio.add(audio);

        // Clean up when done
        audio.onended = () => {
            activeAudio.delete(audio);
        };

        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                // Autoplay was prevented
                console.warn("Notification sound blocked:", error);
                activeAudio.delete(audio);
            });
        }
    } catch (e) {
        console.error("Audio playback error:", e);
    }
}
