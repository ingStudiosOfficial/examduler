import { vibrate } from '@/utils/vibrate';
import type { DirectiveBinding } from 'vue';

export function vibrateDirective(el: Element, binding: DirectiveBinding) {
    return () => {
        const mode = (binding.value as string) || 'light';
        console.log('Vibrating with element, mode:', el, mode);
        vibrate(mode);
    };
}
