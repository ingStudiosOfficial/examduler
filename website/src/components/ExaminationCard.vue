<script setup lang="ts">
import { ref, watch } from 'vue';

import '@material/web/ripple/ripple.js';
import '@material/web/focus/md-focus-ring.js';

import type { Exam } from '@/interfaces/Exam.js';
import type { User } from '@/interfaces/User';
import type { Seating } from '@/interfaces/Seating';

import { getUserSeat, formatExamDate } from '@/utils/exam_utils';

interface ComponentProps {
    exam: Exam;
    user: User;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits(['examClick']);

const userSeat = ref<Seating | null>(null);

function showExamDialog(examInfo: Exam) {
    emit('examClick', examInfo);
}

function tryGetUserSeat() {
    try {
        if (!props.exam.seating || !props.user.email) {
            console.error('Seating or email data not found.');
            return;
        }

        userSeat.value = getUserSeat(props.exam.seating, props.user.email);
    } catch (error) {
        console.error('Error while fetching user seat:', error);
    }
}

watch(
    () => props.exam.seating,
    (newSeating: Seating[][]) => {
        if (newSeating && newSeating.length > 0) {
            tryGetUserSeat();
        }
    },
    { immediate: true },
);
</script>

<template>
    <button class="card" @click="showExamDialog(props.exam)">
        <md-ripple></md-ripple>
        <md-focus-ring style="--md-focus-ring-shape: 25px"></md-focus-ring>
        <h1>{{ props.exam.name }}</h1>
        <p class="exam-date">{{ formatExamDate(props.exam.date) }}</p>
        <p v-show="userSeat" class="exam-seat">Seat {{ userSeat?.seat }}</p>
        <p>{{ props.exam.description }}</p>
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

.exam-date,
.exam-seat {
    font-weight: bold;
}
</style>
