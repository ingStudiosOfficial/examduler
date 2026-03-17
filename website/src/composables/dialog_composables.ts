import { ref, watch } from 'vue';

export function useDialog() {
    const dialogOpened = ref<boolean>(false);

    function openDialog() {
        dialogOpened.value = true;
    }

    function closeDialog() {
        console.log('Dialog closing...');
        dialogOpened.value = false;
    }

    watch(dialogOpened, (isOpen: boolean) => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeDialog();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => document.removeEventListener('keydown', handleEscape);
    });

    return { dialogOpened, openDialog, closeDialog };
}
