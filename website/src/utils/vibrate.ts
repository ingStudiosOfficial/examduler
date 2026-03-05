import { useWebHaptics } from "web-haptics/vue";
const { trigger } = useWebHaptics();

export function vibrate(mode: string) {
    switch (mode) {
        case 'light':
            trigger([
                { duration: 15 },
            ], { intensity: 0.4 });
            break;
    }
}
