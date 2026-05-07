<script setup lang="ts">
import { ref, watch } from 'vue';

import '@m3e/web/card';

import { isFuture } from 'date-fns';

import type { Exam } from '@/interfaces/Exam.js';
import type { User } from '@/interfaces/User';
import type { Seating } from '@/interfaces/Seating';

import { getUserSeat, formatExamDate, getTimeTillExam } from '@/utils/exam_utils';

interface ComponentProps {
    exam: Exam;
    user: User;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits(['examClick']);

const userSeat = ref<Seating | null>(null);
const timeTillExam = ref<string>(getTimeTillExam(new Date(props.exam.date)));
const examIsFuture = ref<boolean>(isFuture(props.exam.date));

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
    () => props.exam.seating || [],
    (newSeating: Seating[][]) => {
        if (newSeating && newSeating.length > 0) {
            tryGetUserSeat();
        }
    },
    { immediate: true },
);
</script>

<template>
    <button
        class="card"
        v-vibrate
        @click="showExamDialog(props.exam)"
        :style="{
            backgroundColor: examIsFuture ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-secondary-container)',
            color: examIsFuture ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-secondary-container)',
        }"
    >
        <md-ripple></md-ripple>
        <md-focus-ring style="--md-focus-ring-shape: 25px"></md-focus-ring>
        <p class="exam-name">{{ props.exam.name }}</p>
        <p class="countdown-text">{{ timeTillExam }}</p>
        <div class="exam-details" v-if="examIsFuture">
            <p class="exam-date">{{ formatExamDate(props.exam.date) }}</p>
            <p v-if="userSeat" class="exam-seat">Seat {{ userSeat?.seat }}</p>
        </div>
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
    align-items: flex-start;
    border-radius: 25px;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    text-align: center;
    width: 100%;
    box-sizing: border-box;
}

.exam-name {
    text-align: start;
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    width: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.exam-date,
.exam-seat {
    font-weight: 400;
    font-size: 1rem;
    margin: 0;
}

.exam-details {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
}

.countdown-text {
    font-size: 1.3rem;
    font-weight: 400;
}
</style>
