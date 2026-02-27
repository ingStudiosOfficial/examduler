<script setup lang="ts">
import '@m3e/web/nav-bar';
import '@m3e/web/icon';
import { router } from '../router/index';

interface ComponentProps {
    pageTitle: string;
}

const props = defineProps<ComponentProps>();

function navigateToPage(page: string) {
    router.push({ name: page });
}
</script>

<template>
    <div class="bar">
        <m3e-nav-bar mode="compact">
            <m3e-nav-item :selected="props.pageTitle.toLowerCase() === 'dashboard'" v-vibrate @click="navigateToPage('dashboard')">
                <m3e-icon slot="icon" name="dashboard"></m3e-icon>
                Dashboard
            </m3e-nav-item>
        </m3e-nav-bar>
    </div>
</template>

<style scoped>
.title {
    font-size: 1.2rem;
    color: var(--md-sys-color-primary);
    font-weight: 600;
}

.bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 10px;
    box-sizing: border-box;
    background-color: var(--md-sys-color-surface-container);
}
</style>