<script setup lang="ts">
import '@material/web/ripple/ripple.js';
import '@material/web/focus/md-focus-ring.js';

import type { Exam } from '@/interfaces/Exam.ts';

const props = defineProps<Exam>();
</script>

<template>
    <button class="card">
        <md-ripple></md-ripple>
        <md-focus-ring style="--md-focus-ring-shape: 25px;"></md-focus-ring>
        <h1>{{ props.name }}</h1>
        <p>{{ props.date }}</p>
        <p>{{ props.description }}</p>
    </button>
</template>

<style scoped>
.card {
    all: unset;
    cursor: pointer;
    position: relative;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 25px;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    text-align: center;
}
</style>