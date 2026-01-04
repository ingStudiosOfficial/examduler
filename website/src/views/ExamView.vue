<script setup lang="ts">
import type { Exam } from '@/interfaces/Exam';
import { fetchPublicExam, getExamId, formatExamDate } from '@/utils/exam_utils';
import { onMounted, ref } from 'vue';

const examDetails = ref<Exam>();

async function tryFetchExam() {
    const examId = getExamId();

    if (!examId) {
        console.error('Failed to get exam ID.');
        return;
    }

    try {
        const exam = await fetchPublicExam(examId);
        
        console.log('Fetched exam:', exam);

        examDetails.value = exam;
    } catch (error) {
        console.error('Error while fetching exams:', error);
    }
}

onMounted(async () => {
    await tryFetchExam();
});
</script>

<template>
    <div v-if="examDetails" class="exam-card">
        <h1 class="exam-name">{{ examDetails.name }}</h1>
        <p class="exam-date">{{ formatExamDate(examDetails.date) }}</p>
        <p>{{ examDetails.description }}</p>
    </div>
</template>

<style scoped>
.exam-card {
    position: fixed;
    top: 50vh;
    left: 50vw;
    transform: translate(-50%, -50%);
    text-align: center;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    width: 40vw;
    height: 80vh;
    border-radius: 25px;
    box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    box-sizing: border-box;
    padding: 20px;
}

.exam-card p {
    white-space: pre-wrap;
}

.exam-card * {
    margin: 0;
}

.exam-name {
    font-size: 35px;
}

.exam-date {
    font-weight: bold;
}
</style>