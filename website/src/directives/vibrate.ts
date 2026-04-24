import { vibrate } from '@/utils/vibrate';

export function vibrateDirective() {
    return () => {
        vibrate();
    };
}
