<script setup lang="ts">
import '@m3e/web/nav-menu';
import '@m3e/web/icon';
import { router } from '../router/index';
import type { RouteLocationAsRelativeGeneric } from 'vue-router';

interface ComponentProps {
    pageTitle: string;
    pageHash?: string;
}

const props = defineProps<ComponentProps>();

function navigateToPage(page: string, hash?: string) {
    const routerPushOptions: RouteLocationAsRelativeGeneric = {
        name: page,
    };

    if (hash) routerPushOptions.hash = hash;

    router.push({ name: page });
}
</script>

<template>
    <div class="menu-wrapper">
        <div class="menu">
            <p class="title">Examduler</p>
            <m3e-nav-menu>
                <m3e-nav-menu-item :selected="props.pageTitle.toLowerCase() === 'dashboard'" v-vibrate @click="navigateToPage('dashboard')">
                    <m3e-icon slot="icon" name="dashboard"></m3e-icon>
                    <span slot="label">Dashboard</span>
                </m3e-nav-menu-item>
                <m3e-nav-menu-item v-vibrate>
                    <m3e-icon slot="icon" name="settings"></m3e-icon>
                    <span slot="label">Settings</span>
                    <m3e-nav-menu-item :selected="props.pageTitle.toLocaleLowerCase() === 'settings' && props.pageHash === 'account'" v-vibrate @click="navigateToPage('settings', 'account')">
                        <m3e-icon slot="icon" name="account_circle"></m3e-icon>
                        <span slot="label">Account</span>
                    </m3e-nav-menu-item>
                </m3e-nav-menu-item>
            </m3e-nav-menu>
        </div>
    </div>
</template>

<style scoped>
.title {
    font-size: 1.2rem;
    color: var(--md-sys-color-primary);
    font-weight: 600;
}

.menu-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
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
    border-radius: 0 25px 25px 0;
    margin: 20px 0;
}
</style>
