<script setup lang="ts">
import '@m3e/web/nav-menu';
import '@m3e/web/icon-button';
import '@m3e/web/icon';
import '@m3e/web/fab';
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
    <div class="menu">
        <p class="title">Examduler</p>
        <m3e-nav-menu>
            <m3e-nav-menu-item :selected="props.pageTitle.toLowerCase() === 'dashboard'" @click="navigateToPage('dashboard')">
                <m3e-icon slot="icon" name="dashboard"></m3e-icon>
                <span slot="label">Dashboard</span>
            </m3e-nav-menu-item>
        </m3e-nav-menu>
    </div>
</template>

<style scoped>
.title {
    font-size: 1.2rem;
    color: var(--md-sys-color-primary);
    font-weight: 600;
}

.menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
    background-color: var(--md-sys-color-surface-container);
}
</style>