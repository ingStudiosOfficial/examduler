<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import NavBar from './components/NavBar.vue';
import { computed, ref } from 'vue';

const route = useRoute();

const routeTitle = computed(() => {
    return route.meta.title || 'Examduler';
});

const expanded = ref<boolean>(false);

function toggleExpand(expandValue: boolean) {
    expanded.value = expandValue;
}
</script>

<template>
    <main :class="expanded ? 'expanded' : ''">
        <NavBar class="navbar" :title="routeTitle" @expand="toggleExpand"></NavBar>
        <div class="router-view">
            <RouterView></RouterView>
        </div>
    </main>
</template>

<style scoped>
main {
    display: grid;
    grid-template-columns: 6dvw 94dvw;
    width: 100%;
}

main.expanded {
    grid-template-columns: 20dvw 80dvw;
}

.navbar {
    width: 100%;
}

.router-view {
    width: 100%;
}
</style>
