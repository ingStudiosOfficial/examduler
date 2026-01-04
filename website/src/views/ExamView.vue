<script setup lang="ts">
import LoaderContainer from '@/components/LoaderContainer.vue';
import type { Exam } from '@/interfaces/Exam';
import { fetchPublicExam, getExamId, formatExamDate } from '@/utils/exam_utils';
import { onMounted, ref } from 'vue';

const examDetails = ref<Exam>();
const examId = ref<string | null>();
const isLoading = ref<boolean>(true);

async function tryFetchExam() {
    examId.value = getExamId();

    if (!examId.value) {
        console.error('Failed to get exam ID.');
        isLoading.value = false;
        return;
    }

    try {
        const exam = await fetchPublicExam(examId.value);
        
        console.log('Fetched exam:', exam);

        examDetails.value = exam;
    } catch (error) {
        console.error('Error while fetching exams:', error);
    }

    isLoading.value = false;
}

onMounted(async () => {
    await tryFetchExam();
});
</script>

<template>
    <div class="loader" v-if="isLoading">
        <LoaderContainer loading-text="Hang on while we fetch your examination." loader-color="var(--md-sys-color-primary)"></LoaderContainer>
    </div>
    <div v-if="examDetails && !isLoading" class="exam-card">
        <h1 class="exam-name">{{ examDetails.name }}</h1>
        <p class="exam-date">{{ formatExamDate(examDetails.date) }}</p>
        <p>{{ examDetails.description }}</p>
    </div>
    <div v-else-if="examId && !isLoading" class="exam-card not-found">
        <p>Exam with ID '{{ examId }}' not found.</p>
    </div>
    <div v-else-if="!isLoading" class="exam-card not-found">
        <p>No exam ID provided.</p>
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

.not-found {
    justify-content: center;
}

.loader {
    position: fixed;
    top: 50vh;
    left: 50vw;
    transform: translate(-50%, -50%);
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
}

@media (max-width: 768px) {
    .exam-card {
        width: 90vw;
    }
}
</style>