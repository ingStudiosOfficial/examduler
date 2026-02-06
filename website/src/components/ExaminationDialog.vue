<script setup lang="ts">
import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';

import SeatingContainer from './SeatingContainer.vue';

import type { Exam } from '@/interfaces/Exam';
import type { User } from '@/interfaces/User';
import type { Seating } from '@/interfaces/Seating';

import { deleteExam, formatExamDate, getUserSeat, shareExam } from '@/utils/exam_utils';

interface ComponentProps {
    exam: Exam;
    user: User;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits(['close', 'showSb', 'refresh', 'edit']);

function tryGetUserSeat(seating: Seating[][], email: string): Seating | null {
    try {
        if (!seating || !email) {
            console.error('Seating or email data not found.');
            return null;
        }

        return getUserSeat(seating, email);
    } catch (error) {
        console.error('Error while fetching user seat:', error);
        return null;
    }
}

async function triggerShareExam() {
    const { message, success } = await shareExam(props.exam);

    if (!success) {
        console.error('Failed to share exam:', message);
        emit('showSb', message);
        return;
    }

    console.log('Successfully shared exam.');

    emit('showSb', message);
}

async function triggerDeleteExam() {
    if (!confirm(`Are you sure you want to delete the examination '${props.exam.name}'?`)) return;

    const { message, success } = await deleteExam(props.exam);

    if (!success) {
        console.error('Failed to delete exam:', message);
        emit('showSb', message);
        return;
    }

    console.log('Successfully deleted exam.');

    emit('refresh');
    emit('close');
    emit('showSb', message);
}

async function triggerEditExam() {
    console.log('Attempting to edit exam...');
    emit('edit', props.exam);
    closeDialog();
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
                <div class="left-buttons">
                    <md-icon-button v-if="userData.role === 'teacher' || userData.role === 'admin'" v-vibrate @click="triggerDeleteExam()">
                        <md-icon>delete</md-icon>
                    </md-icon-button>
                    <md-icon-button v-if="userData.role === 'teacher' || userData.role === 'admin'" v-vibrate @click="triggerEditExam()">
                        <md-icon>edit</md-icon>
                    </md-icon-button>
                </div>
                <div class="exam-headers">
                    <h1 class="exam-name">{{ props.exam.name }}</h1>
                    <p class="exam-date">({{ formatExamDate(props.exam.date) }})</p>
                </div>
                <div class="right-buttons">
                    <md-icon-button @click="triggerShareExam()">
                        <md-icon>share</md-icon>
                    </md-icon-button>
                    <md-icon-button @click="closeDialog()">
                        <md-icon>close</md-icon>
                    </md-icon-button>
                </div>
            </div>
            <div class="mobile-headers">
                <h1 class="exam-name">{{ props.exam.name }}</h1>
                <p class="exam-date">({{ formatExamDate(props.exam.date) }})</p>
            </div>
            <h1 class="section-header">Description</h1>
            <p class="exam-description">{{ props.exam.description }}</p>
            <h1 class="section-header">Seating</h1>
            <p>Your seat: <b>{{ tryGetUserSeat(props.exam.seating, props.user.email)?.seat }}</b></p>
            <div class="seating-wrapper">
                <SeatingContainer :seating="props.exam.seating" :user-seat="tryGetUserSeat(props.exam.seating, props.user.email)" class="seating"></SeatingContainer>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dialog p {
    white-space: pre-wrap;
}

.exam-name {
    font-size: 1.7em;
    max-width: 50%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--md-sys-color-primary);
}

.exam-date {
    font-weight: bold;
    color: var(--md-sys-color-primary);
}

.exam-description {
    width: 90%;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    word-break: break-all;
}

.section-header {
    font-size: 1.7em;
    color: var(--md-sys-color-primary);
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
    background-color: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    top: 0;
    left: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
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
    pointer-events: none;
}

.right-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
}

.left-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
}

.mobile-headers {
    width: 100%;
    display: none;
    flex-direction: column;
    align-items: center;
    gap: 20px;
}

@media (max-width: 768px) {
    .seating {
        display: none;
    }

    .exam-headers {
        display: none;
    }

    .mobile-headers {
        display: flex;
    }

    .exam-name {
        max-width: 90%;
    }
}
</style>
