<script setup lang="ts">
import type { RouteTitle } from '@/types/router';
import { computed, onMounted, onUnmounted, ref } from 'vue';

interface ComponentProps {
    title: RouteTitle;
};

interface NavLink {
    title: RouteTitle;
    url: string;
}

const props = defineProps<ComponentProps>();

const isScrolled = ref<boolean>(false);
const allNavLinks: NavLink[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
    }
];

const visibleNavLinks = computed(() => {
    return allNavLinks.filter(l => l.title !== props.title);
});

let timeout: number | null = null;

function handleScroll() {
    if (timeout) return;

    timeout = window.setTimeout(() => {
        isScrolled.value = window.scrollY > 10;
        timeout = null;
    }, 100);
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
    <header :class="`page-header ${isScrolled ? 'scrolled' : ''}`">
        <img src="/examduler_logo_trans_full.png" class="examduler-logo" />
        <h1 class="page-title">{{ props.title }}</h1>
        <a v-for="link in visibleNavLinks" :key="link.title" class="nav-link" :href="link.url">{{ link.title }}</a>
    </header>
</template>

<style scoped>
.page-header {
    width: 100%;
    max-height: 10%;
    padding: 10px;
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
    text-align: center;
}

.page-header.scrolled {
    background-color: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface-container);
}

.examduler-title {
    color: var(--md-sys-color-primary);
    font-size: 1.2rem;
}

.examduler-logo {
    height: 8dvh;
}

.page-title {
    margin: 0;
    font-size: 1.2rem;
}

.nav-link {
    text-decoration: none;
    color: inherit;
}

.nav-link:hover {
    text-decoration: underline;
}
</style>