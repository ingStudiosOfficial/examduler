import { useData } from 'vitepress';
import { computed } from 'vue';

export function useUpdated() {
    const { page } = useData();

    const lastUpdated = computed(() => {
        if (page.value.lastUpdated) {
            return new Date(page.value.lastUpdated).toLocaleString();
        }

        return '';
    });

    return { lastUpdated };
}