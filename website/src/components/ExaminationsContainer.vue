<script setup lang="ts">
// Vue utils
import { onMounted, ref, watch } from 'vue';

// Views
import ExaminationCard from './ExaminationCard.vue';
import ExaminationDialog from './ExaminationDialog.vue';
import LoaderContainer from './LoaderContainer.vue';
import ExaminationEditDialog from './ExaminationEditDialog.vue';

// Interfaces
import type { Exam } from '@/interfaces/Exam';
import type { User } from '@/interfaces/User';

// Utils
import { fetchAllExams, sortExams } from '@/utils/exam_utils';
import { fetchCachedExams } from '@/utils/cache_utils';
import { useDialog } from '@/composables/dialog_composables';
import { showSnackbar } from '@/utils/snackbar';

interface ComponentProps {
    user: User;
    refresh: boolean;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits(['fetchedExams']);

const { dialogOpened: examOpened, openDialog: displayExamDialog, closeDialog: closeExamDialog } = useDialog();
const { dialogOpened: editDialogOpened, openDialog: showEditDialog, closeDialog: closeEditDialog } = useDialog();

const exams = ref<Exam[]>();
const examDetails = ref<Exam | null>(null);
const examToEdit = ref<Exam | null>();

async function refreshExams() {
    try {
        const fetchedExams = await fetchAllExams();
        exams.value = sortExams(fetchedExams);
    } catch (error) {
        console.error('Error while fetching exams:', error);

        const cachedExams = await fetchCachedExams();
        console.log('Cached exams:', cachedExams);
        exams.value = sortExams(cachedExams);
    } finally {
        emit('fetchedExams', exams.value);
    }
}

function displaySb(message: string) {
    showSnackbar(message, 4000);
}

function handleDisplayExam(exam: Exam) {
    examDetails.value = exam;
    displayExamDialog();
}

function handleShowEdit(exam: Exam) {
    examToEdit.value = exam;
    showEditDialog();
}

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

onMounted(async () => {
    await refreshExams();
});
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

        <ExaminationDialog v-if="examOpened && examDetails?._id && examDetails.name && examDetails.description" :exam="examDetails" :user="props.user" @close="closeExamDialog()" @show-sb="displaySb" @refresh="refreshExams()" @edit="handleShowEdit"></ExaminationDialog>
        <ExaminationEditDialog v-if="editDialogOpened && examToEdit" :_id="examToEdit._id" :name="examToEdit.name" :date="examToEdit.date" :description="examToEdit.description" :seating="examToEdit.seating" @show-sb="displaySb" @refresh="refreshExams()" @close="closeEditDialog()" @success="refreshExams()"></ExaminationEditDialog>
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
