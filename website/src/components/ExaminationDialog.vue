<script setup lang="ts">
import SeatingContainer from './SeatingContainer.vue';

import type { Exam } from '@/interfaces/Exam';
import type { User } from '@/interfaces/User';

import { formatExamDate } from '@/utils/exam_utils';

interface ComponentProps {
    exam: Exam;
    user: User;
}

const props = defineProps<ComponentProps>();

const userData = props.user;
</script>

<template>
    <div class="backdrop">
        <div class="dialog">
            <h1 class="exam-name">{{ props.exam.name }}</h1>
            <p>{{ formatExamDate(props.exam.date) }}</p>
            <p>{{ props.exam.description }}</p>
            <h1 class="section-header">Seating</h1>
            <div class="seating-wrapper">
                <SeatingContainer :seating="props.exam.seating" :email="userData.email" class="seating"></SeatingContainer>
            </div>
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
    overflow-x: hidden;
}

.exam-name {
    font-size: 35px;
}

.section-header {
    font-size: 25px;
}

.seating-wrapper {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.seating {
    max-width: 90%;
}

@media (max-width: 768px) {
    .seating {
        display: none;
    }
}
</style>