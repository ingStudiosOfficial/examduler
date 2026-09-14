<script setup lang="ts">
import LoaderContainer from '@/components/LoaderContainer.vue';
import type { PublicExam } from '@/interfaces/Exam';
import { fetchPublicExam, getExamId, formatExamDate, downloadExam, addExamToGoogleCalendar } from '@/utils/exam_utils';
import { onMounted, ref } from 'vue';
import '@m3e/web/button';
import '@m3e/web/menu';
import '@m3e/web/icon';
import { showSnackbar } from '@/utils/snackbar';
import router from '@/router';

const examDetails = ref<PublicExam>();
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
        document.title = `Examination ${exam.name} | Examduler`;
    } catch (error) {
        console.error('Error while fetching exams:', error);
    }

    isLoading.value = false;
}

async function triggerDownloadExam() {
    if (!examDetails.value) {
        console.error('Exam details is missing.');
        showSnackbar('No examination details found', 4000);
        return;
    }

    const { message, success } = await downloadExam(examDetails.value);

    if (!success) {
        console.error('Failed to downloaded exam:', message);
        showSnackbar(message);
        return;
    }

    console.log('Successfully downloaded exam');

    showSnackbar('Successfully downloaded examination', 4000);
}

function triggerAddExamToGoogleCalendar() {
    if (!examDetails.value) {
        console.error('Exam details is missing.');
        showSnackbar('No examination details found', 4000);
        return;
    }

    addExamToGoogleCalendar(examDetails.value);
}

onMounted(async () => {
    await tryFetchExam();
});
</script>

<template>
    <div class="content-wrapper">
        <div class="loader" v-if="isLoading">
            <LoaderContainer loading-text="Hang on while we fetch your examination." loader-color="var(--md-sys-color-primary)"></LoaderContainer>
        </div>
        <div v-if="examDetails && !isLoading" class="exam-card">
            <div class="card-top">
                <h1 class="exam-name">{{ examDetails.name }}</h1>
                <p class="exam-date">{{ formatExamDate(examDetails.date) }}</p>
                <div class="description-wrapper">
                    <p class="exam-description">{{ examDetails.description }}</p>
                </div>
            </div>
            <div class="card-bottom">
                <m3e-button variant="filled" @click="router.push('/login')">
                    <m3e-icon slot="icon" name="login"></m3e-icon>
                    Student login
                </m3e-button>
                <m3e-button variant="outlined" v-vibrate id="download-button" class="download-button">
                    <m3e-icon slot="icon" name="calendar_add_on"></m3e-icon>
                    <m3e-menu-trigger for="download-menu">Add event</m3e-menu-trigger>
                </m3e-button>
                <m3e-menu id="download-menu" position-y="above">
                    <m3e-menu-item v-vibrate @click="triggerAddExamToGoogleCalendar()">
                        Add to Google Calendar
                        <m3e-icon name="calendar_add_on" slot="icon"></m3e-icon>
                    </m3e-menu-item>
                    <m3e-menu-item v-vibrate @click="triggerDownloadExam()">
                        Download as event
                        <m3e-icon name="download" slot="icon"></m3e-icon>
                    </m3e-menu-item>
                </m3e-menu>
                <p class="examduler-footer">Powered by Examduler</p>
            </div>
        </div>
        <div v-else-if="examId && !isLoading" class="exam-card not-found">
            <p>Exam with ID '{{ examId }}' not found.</p>
        </div>
        <div v-else-if="!isLoading" class="exam-card not-found">
            <p>No exam ID provided.</p>
        </div>
    </div>
</template>

<style scoped>
.content-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
}

.exam-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    width: 40svw;
    height: 80svh;
    border-radius: 25px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    box-sizing: border-box;
    padding: 20px;
    transition: box-shadow 0.3s ease;
    overflow-y: scroll;
}

.exam-card:hover {
    box-shadow: 0 10px 10px rgba(0, 0, 0, 0.5);
}

.card-top {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
    flex-grow: 1;
}

.exam-card p {
    white-space: pre-wrap;
}

.exam-card * {
    margin: 0;
}

.exam-name {
    font-size: 2em;
}

.exam-date {
    font-weight: bold;
}

.not-found {
    justify-content: center;
}

.loader {
    position: fixed;
    top: 50svh;
    left: 50svw;
    transform: translate(-50%, -50%);
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
}

.exam-description {
    width: 80%;
    overflow-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
}

.description-wrapper {
    width: 100%;
    height: 65%;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.card-bottom {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    width: 100%;
}

@media (max-width: 768px) {
    .exam-card {
        width: 90svw;
    }

    .download-button {
        position: relative;
        bottom: unset;
        left: unset;
    }

    .examduler-footer {
        position: relative;
        bottom: unset;
        right: unset;
    }
}
</style>
