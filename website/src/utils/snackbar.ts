import { M3eSnackbar } from "@m3e/web/snackbar";

export function showSnackbar(message: string, duration: number = 4000, buttonText?: string, callback?: (...params: unknown[]) => unknown, ...params: unknown[]) {
    console.log('Showing snackbar...');
    if (buttonText && callback) {
        M3eSnackbar.open(message, buttonText, true, { duration: duration, actionCallback: () => {
            callback(params);
        }});
    } else {
        M3eSnackbar.open(message, true, { duration: duration });
    }
}