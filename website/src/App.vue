<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import NavBar from './components/NavBar.vue';
import { computed } from 'vue';

const route = useRoute();

const routeTitle = computed(() => {
    return route.meta.title || 'Examduler';
});
</script>

<template>
    <main>
        <NavBar v-if="routeTitle.toLowerCase() !== 'login'" class="navbar" :page-title="routeTitle" />
        <div class="router-view">
            <RouterView></RouterView>
        </div>
    </main>
</template>

<style scoped>
main {
    display: flex;
    flex-direction: row;
    width: 100dvw;
    height: 100dvh;
}

.navbar {
    height: 100%;
    overflow-y: auto;
}

.router-view {
    height: 100%;
    overflow-y: auto;
    flex: 1;
}

@media (max-width: 768px) {
    .navbar {
        display: none;
    }
}
</style>