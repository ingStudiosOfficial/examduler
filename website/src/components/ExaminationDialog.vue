<script setup lang="ts">
import '@m3e/web/icon-button';
import '@m3e/web/icon';

import SeatingContainer from './SeatingContainer.vue';

import type { Exam } from '@/interfaces/Exam';
import type { User } from '@/interfaces/User';
import type { Seating } from '@/interfaces/Seating';

import { deleteExam, formatExamDate, getUserSeat, shareExam } from '@/utils/exam_utils';
import { DialogUtils } from '@/utils/dialog_utils';
import { computed, onMounted, onUnmounted } from 'vue';
import { useExams } from '@/stores/exams_store';

interface ComponentProps {
    id: string;
    user: User;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits(['close', 'showSb', 'refresh', 'edit']);

const examsStore = useExams();

const examDetails = computed<Exam | undefined>(() => {
    return examsStore.exams.find(e => e._id === props.id);
});

const userData = props.user;

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
    if (!examDetails.value) return;

    const { message, success } = await shareExam(examDetails.value);

    if (!success) {
        console.error('Failed to share exam:', message);
        emit('showSb', message);
        return;
    }

    console.log('Successfully shared exam.');

    emit('showSb', message);
}

async function triggerDeleteExam() {
    if (!(await DialogUtils.confirm(`Are you sure you want to delete the examination '${examDetails.value?.name}'?`, 'Delete Examination')) || !examDetails.value) return;

    const { message, success } = await deleteExam(examDetails.value);

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
    if (!examDetails.value) return;
    console.log('Attempting to edit exam...');
    emit('edit', examDetails.value);
}

function closeDialog() {
    emit('close');
}

function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
        event.preventDefault();
        closeDialog();
    }
}

onMounted(() => {
    document.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
    document.removeEventListener('keydown', onKeyDown);
})
</script>

<template>
    <div class="backdrop" v-if="examDetails">
        <div class="dialog">
            <div class="top-panel">
                <div class="left-buttons">
                    <m3e-icon-button v-if="userData.role === 'teacher' || userData.role === 'admin'" v-vibrate @click="triggerDeleteExam()">
                        <m3e-icon name="delete"></m3e-icon>
                    </m3e-icon-button>
                    <m3e-icon-button v-if="userData.role === 'teacher' || userData.role === 'admin'" v-vibrate @click="triggerEditExam()">
                        <m3e-icon name="edit"></m3e-icon>
                    </m3e-icon-button>
                </div>
                <div class="exam-headers">
                    <h1 class="exam-name">{{ examDetails.name }}</h1>
                    <p class="exam-date">({{ formatExamDate(examDetails.date) }})</p>
                </div>
                <div class="right-buttons">
                    <m3e-icon-button v-vibrate @click="triggerShareExam()">
                        <m3e-icon name="share"></m3e-icon>
                    </m3e-icon-button>
                    <m3e-icon-button v-vibrate @click="closeDialog()">
                        <m3e-icon name="close"></m3e-icon>
                    </m3e-icon-button>
                </div>
            </div>
            <div class="mobile-headers">
                <h1 class="exam-name">{{ examDetails.name }}</h1>
                <p class="exam-date">({{ formatExamDate(examDetails.date) }})</p>
            </div>
            <h1 class="section-header">Description</h1>
            <p class="exam-description">{{ examDetails.description }}</p>
            <h1 v-if="examDetails.seating && examDetails.seating.length !== 0" class="section-header">Seating</h1>
            <p v-if="examDetails.seating && tryGetUserSeat(examDetails.seating, props.user.email)">
                Your seat:
                <b>{{ tryGetUserSeat(examDetails.seating, props.user.email)?.seat }}</b>
            </p>
            <div v-if="examDetails.seating && examDetails.seating.length !== 0" class="seating-wrapper">
                <SeatingContainer :seating="examDetails.seating" :user-seat="tryGetUserSeat(examDetails.seating, props.user.email)" class="seating"></SeatingContainer>
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
