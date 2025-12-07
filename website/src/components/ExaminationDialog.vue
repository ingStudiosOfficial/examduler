<script setup lang="ts">
import SeatingContainer from './SeatingContainer.vue';

import type { Exam } from '@/interfaces/Exam';

const props = defineProps<Partial<Exam>>();
</script>

<template>
    <div class="backdrop">
        <div class="dialog">
            <h1 class="exam-name">{{ props.name }}</h1>
            <p>{{ props.date }}</p>
            <p>{{ props.description }}</p>
            <h1 class="section-header">Seating</h1>
            <SeatingContainer :seating="props.seating" class="seating"></SeatingContainer>
        </div>
    </div>
</template>

<style scoped>
.backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: auto;
    background-color: rgba(0, 0, 0, 0.5);
}

.dialog {
    width: 75vw;
    height: 75vh;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border-radius: 25px;
    overflow-y: scroll;
    box-sizing: border-box;
}

.exam-name {
    font-size: 35px;
}

.section-header {
    font-size: 25px;
}

.seating {
    max-width: 100%;
    overflow-x: scroll;
}
</style>