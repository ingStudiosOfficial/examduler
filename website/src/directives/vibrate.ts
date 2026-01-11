import { vibrate } from "@/utils/vibrate";
import type { DirectiveBinding } from "vue";

export function vibrateDirective(el: Element, binding: DirectiveBinding) {
    return () => {
        const duration = (binding.value as number[]) || [10];
        console.log('Vibrating with element, duration:', el, duration);
        vibrate(duration);
    };
}