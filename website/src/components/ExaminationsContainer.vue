<script setup lang="ts">
// Vue utils
import { onMounted, watch } from 'vue';

// Views
import ExaminationCard from './ExaminationCard.vue';
import LoaderContainer from './LoaderContainer.vue';

// Interfaces
import type { Exam } from '@/interfaces/Exam';
import type { User } from '@/interfaces/User';

// Utils
import { fetchAllExams, sortExams } from '@/utils/exam_utils';
import { showSnackbar } from '@/utils/snackbar';
import { useExams } from '@/stores/exams_store';
import { storeToRefs } from 'pinia';
import router from '@/router';

interface ComponentProps {
    user: User;
    refresh: number | boolean;
}

const props = defineProps<ComponentProps>();

const examStore = useExams();

const { exams } = storeToRefs(examStore);

function displaySb(message: string) {
    showSnackbar(message, 4000);
}

function handleDisplayExam(exam: Exam) {
    router.push({ name: 'exam-details', params: { id: exam._id } });
}

function handleShowEdit(exam: Exam) {
    router.push({ name: 'exam-update', params: { id: exam._id } });
}

onMounted(async () => {
    await examStore.refreshExams();
});

watch(
    () => props.refresh,
    async (newValue) => {
        if (newValue === true) {
            try {
                const fetchedExams = await fetchAllExams();
                exams.value = sortExams(fetchedExams);
                newValue = !newValue;
            } catch (error) {
                console.error('Error while refreshing exams:', error);
                newValue = !newValue;
            }
        }
    },
);
</script>

<template>
    <div class="content-wrapper">
        <h1 class="examinations-header">Your Examinations</h1>
        <div class="exams-loaded" v-if="exams">
            <div class="examinations" v-if="exams.length > 0">
                <ExaminationCard v-for="exam in exams" :key="exam._id" :exam="exam" :user="props.user" @exam-click="handleDisplayExam"></ExaminationCard>
            </div>

            <p v-else class="no-exams">Time to relax! No scheduled examinations at the moment.</p>
        </div>
        <LoaderContainer v-else loader-color="var(--md-sys-color-primary)" loading-text="Hang on while we load your examinations..."></LoaderContainer>

        <RouterView
            :user="props.user"
            @close="router.back()"
            @show-sb="displaySb"
            @refresh="examStore.refreshExams()"
            @success="examStore.refreshExams()"
            @edit="handleShowEdit"
        />
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: auto;
    gap: 10px;
    box-sizing: border-box;
    align-items: stretch;
    justify-content: stretch;
    width: 100%;
}

.exams-loaded {
    width: 100%;
}

.no-exams {
    color: var(--md-sys-color-primary);
    font-size: 1.5rem;
    text-align: center;
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
