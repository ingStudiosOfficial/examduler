import { defaultPatterns, WebHaptics } from "web-haptics";

export function vibrate() {
    const haptics = new WebHaptics();
    haptics.trigger(defaultPatterns.light);
}
