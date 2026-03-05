import { vibrate } from '@/utils/vibrate';
import type { DirectiveBinding } from 'vue';

export function vibrateDirective(el: Element, binding: DirectiveBinding) {
    return () => {
        const pattern = (binding.value as number[]) || [6];
        console.log('Vibrating with element, duration:', el, pattern);
        vibrate(pattern);
    };
}
