<script setup lang="ts">
interface ComponentProps {
    title: string;
}

const props = defineProps<ComponentProps>();
</script>

<template>
    <h2 class="settings-header">{{ props.title }}</h2>
    <slot class="settings-content"></slot>
</template>

<style scoped>
.settings-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
}

.settings-header {
    color: var(--md-sys-color-primary);
}
</style>