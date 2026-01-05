<script setup lang="ts">
import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';

import SeatingContainer from './SeatingContainer.vue';

import type { Exam } from '@/interfaces/Exam';
import type { User } from '@/interfaces/User';
import type { Seating } from '@/interfaces/Seating';

import { formatExamDate, getUserSeat, shareExam } from '@/utils/exam_utils';
import { vibrate } from '@/utils/vibrate';

interface ComponentProps {
    exam: Exam;
    user: User;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits(['close', 'showSb']);

function tryGetUserSeat(): Seating | null {
    try {
        if (!props.exam.seating || !props.user.email) {
            console.error('Seating or email data not found.');
            return null;
        }

        return getUserSeat(props.exam.seating, props.user.email);
    } catch (error) {
        console.error('Error while fetching user seat:', error);
        return null;
    }
}

async function triggerShareExam() {
    vibrate([10]);

    const { message, success } = await shareExam(props.exam);

    if (!success) {
        console.error('Failed to share exam:', message);
        emit('showSb', message);
        return;
    }

    console.log('Successfully shared exam.');

    emit('showSb', message);
}

function closeDialog() {
    emit('close');
}

const userData = props.user;
</script>

<template>
    <div class="backdrop">
        <div class="dialog">
            <div class="top-panel">
                <div class="exam-headers">
                    <h1 class="exam-name">{{ props.exam.name }}</h1>
                    <p class="exam-date">({{ formatExamDate(props.exam.date) }})</p>
                </div>
                <md-icon-button @click="triggerShareExam()">
                    <md-icon>share</md-icon>
                </md-icon-button>
                <md-icon-button @click="closeDialog()">
                    <md-icon>close</md-icon>
                </md-icon-button>
            </div>
            <h1 class="section-header">Description</h1>
            <p>{{ props.exam.description }}</p>
            <h1 class="section-header">Seating</h1>
            <p>Your seat: <b>{{ tryGetUserSeat()?.seat }}</b></p>
            <div class="seating-wrapper">
                <SeatingContainer :seating="props.exam.seating" :email="userData.email" :user-seat="tryGetUserSeat()" class="seating"></SeatingContainer>
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
    z-index: 999;
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
    z-index: 1000;
    position: relative;
    gap: 20px;
}

.dialog * {
    margin: 0;
}

.dialog p {
    white-space: pre-wrap;
}

.exam-name {
    font-size: 35px;
    max-width: 60%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.exam-date {
    font-weight: bold;
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

.top-panel {
    position: sticky;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-secondary-container);
    top: 0;
    left: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding: 10px;
    box-sizing: border-box;
    width: 100%;
    border-bottom: 1px solid var(--md-sys-color-outline);
    z-index: 1001;
    text-align: center;
}

.exam-headers {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 20px;
}

@media (max-width: 768px) {
    .seating {
        display: none;
    }
}
</style>
