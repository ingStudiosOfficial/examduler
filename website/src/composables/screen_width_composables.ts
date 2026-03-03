import { onMounted, onUnmounted, ref } from 'vue';

export function useCheckMobile() {
    const isMobile = ref<boolean>(false);

    const widthMediaQuery = '(max-width: 768px)';

    function update(event: MediaQueryListEvent) {
        isMobile.value = event.matches;
    }

    onMounted(() => {
        const mediaQueryList = window.matchMedia(widthMediaQuery);
        isMobile.value = mediaQueryList.matches;

        mediaQueryList.addEventListener('change', update);
    });

    onUnmounted(() => {
        const mediaQueryList = window.matchMedia(widthMediaQuery);
        mediaQueryList.removeEventListener('change', update);
    });

    return { isMobile };
}
