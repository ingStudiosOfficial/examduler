<script setup lang="ts">
// Vue utils
import { ref, watch } from 'vue';

// Views
import ExaminationCard from './ExaminationCard.vue';
import ExaminationDialog from './ExaminationDialog.vue';

// Sample examination data
import sampleExams from '../samples/sample_exams.json' with { type: 'json' };

// Interfaces
import type { Exam } from '@/interfaces/Exam';
import type { User } from '@/interfaces/User';

// Utils
import { parseExams, sortExams } from '@/utils/exam_utils';

interface ComponentProps {
    user: User;
}

const props = defineProps<ComponentProps>();

const exams = ref<Exam[]>(sortExams(parseExams(JSON.stringify(sampleExams))));

const examOpened = ref<boolean>(false);
const examDetails = ref<Exam | null>(null)

function displayExamDialog(examInfo: Exam) {
    examDetails.value = examInfo;
    examOpened.value = true;
}

function closeExamDialog() {
    console.log('Exam dialog closing...');
    examOpened.value = false;
    examDetails.value = null;
}

watch(examOpened, (isOpen: boolean) => {
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeExamDialog();
    };

    if (isOpen) {
        document.addEventListener('keydown', handleEscape);
    }

    return () => document.addEventListener('keydown', handleEscape);
});
</script>

<template>
    <div class="content-wrapper">
        <h1 class="examinations-header">Your Examinations</h1>
        <div class="examinations">
            <ExaminationCard v-for="exam in exams" :key="exam._id" :exam="exam" :user="props.user" @exam-click="displayExamDialog"></ExaminationCard>
        </div>
        <ExaminationDialog v-if="examOpened && examDetails?._id && examDetails.name && examDetails.description && examDetails.meta && examDetails.seating" :exam="examDetails" :user="props.user" @close="closeExamDialog()"></ExaminationDialog>
    </div>
</template>

<style scoped>
.content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
}

.examinations-header {
    color: var(--md-sys-color-primary);
}

.examinations {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto;
    gap: 10px;
    box-sizing: border-box;
    align-items: stretch;
    justify-content: stretch;
    width: 100%;
}

@media (max-width: 768px) {
    .examinations {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
    }
}
</style>