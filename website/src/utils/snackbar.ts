import type { StateObject } from "@/interfaces/SnackBar";

export function showSnackBar(duration: number, stateObject: StateObject) {
    stateObject.visible = true;

    setTimeout(() => {
        stateObject.visible = false;
        console.log('Snack bar hidden.');
    }, duration);
}