<script setup lang="ts">
// Vue utils
import { ref } from 'vue';

// Views
import ExaminationCard from './ExaminationCard.vue';

// Sample examination data
import sampleExams from '../samples/sample_exams.json' with { type: 'json' };

// Interfaces
import type { Exam } from '@/interfaces/Exam';

// Utils
import { parseExams, sortExams } from '@/utils/exam_utils';

const exams = ref<Exam[]>(sortExams(parseExams(JSON.stringify(sampleExams))));
</script>

<template>
    <div class="content-wrapper">
        <h1 class="examinations-header">Your Examinations</h1>
        <div class="examinations">
            <ExaminationCard v-for="exam in exams" :key="exam._id" :_id="exam._id" :name="exam.name" :date="exam.date" :description="exam.description" :meta="exam.meta" :seating="exam.seating"></ExaminationCard>
        </div>
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
}
</style>