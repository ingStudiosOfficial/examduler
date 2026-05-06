import { defaultPatterns, WebHaptics } from "web-haptics";

const haptics = new WebHaptics();

export function vibrate(patternMode: keyof typeof defaultPatterns = 'light') {
    const pattern = defaultPatterns[patternMode] || defaultPatterns.light;
    console.log('Vibrating with pattern:', pattern);
    haptics.trigger(pattern);
}