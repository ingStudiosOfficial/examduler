import { defaultPatterns, WebHaptics } from "web-haptics";

const haptics = new WebHaptics();

export function vibrate() {
    haptics.trigger(defaultPatterns.light);
}