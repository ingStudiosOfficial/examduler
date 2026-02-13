<script setup lang="ts">
import type { RouteTitle } from '@/types/router';
import { onMounted, ref } from 'vue';

interface ComponentProps {
    title: RouteTitle;
};

interface NavLink {
    title: RouteTitle;
    url: string;
}

const props = defineProps<ComponentProps>();

const isScrolled = ref<boolean>(false);
const navLinks = ref<NavLink[]>([
    {
        title: 'Dashboard',
        url: '/dashboard',
    }
]);

let timeout: number | null = null;

function handleScroll() {
    if (timeout) return;

    timeout = window.setTimeout(() => {
        isScrolled.value = window.scrollY > 10;
        timeout = null;
    }, 100);
}

function removeCurrentNavLink() {
    const routeTitles = navLinks.value.map(l => l.title);

    if (routeTitles.includes(props.title)) routeTitles.splice(routeTitles.indexOf(props.title), 1);
}

onMounted(() => {
    removeCurrentNavLink();
    window.addEventListener('scroll', handleScroll);
});
</script>

<template>
    <header :class="`page-header ${isScrolled ? 'scrolled' : ''}`">
        <h1 class="page-title">{{ props.title }}</h1>
        <p v-for="link in navLinks" :key="" class="nav-link"></p>
    </header>
</template>

<style scoped>
.page-header {
    width: 100%;
    max-height: 10%;
    padding: 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20px;
    background-color: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    position: sticky;
    top: 0;
    left: 0;
    z-index: 500;
    box-sizing: border-box;
    transition: background-color 0.5s ease, color 0.5s ease;
}

.page-header.scrolled {
    background-color: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface-container);
}

.page-title {
    margin: 0;
    font-size: 1.2rem;
}
</style>