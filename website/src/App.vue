<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import NavMenu from './components/NavMenu.vue';
import NavBar from './components/NavBar.vue';
import { computed } from 'vue';

const route = useRoute();

const routeTitle = computed(() => {
    return route.meta.title || 'Examduler';
});
</script>

<template>
    <main>
        <NavMenu v-if="routeTitle.toLowerCase() !== 'login'" class="nav-menu" :page-title="routeTitle"></NavMenu>
        <div class="router-view">
            <RouterView></RouterView>
        </div>
        <NavBar v-if="routeTitle.toLowerCase() !== 'login'" class="navbar" :page-title="routeTitle"></NavBar>
    </main>
</template>

<style scoped>
main {
    display: flex;
    flex-direction: row;
    width: 100dvw;
    height: 100dvh;
}

.nav-menu {
    height: 100%;
    overflow-y: auto;
}

.navbar {
    display: none;
}

.router-view {
    height: 100%;
    overflow-y: auto;
    flex: 1;
}

@media (max-width: 768px) {
    main {
        flex-direction: column;
        overflow-x: hidden;
    }

    .nav-menu {
        display: none;
    }

    .navbar {
        display: block;
        height: auto;
        width: 100%;
        flex-shrink: 0;
    }

    .router-view {
        height: auto;
        flex: 1;
        width: 100%;
    }
}
</style>