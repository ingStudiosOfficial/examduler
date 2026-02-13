<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import NavBar from './components/NavBar.vue';
import { computed } from 'vue';

const route = useRoute();

const routeTitle = computed(() => {
    return route.meta.title || 'Examduler';
});

console.log(routeTitle);
</script>

<template>
    <main>
        <NavBar :title="routeTitle"></NavBar>
        <RouterView></RouterView>
    </main>
</template>

<style scoped>
</style>
