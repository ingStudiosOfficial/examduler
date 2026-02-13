<script setup lang="ts">
import LoaderContainer from '@/components/LoaderContainer.vue';
import type { PublicExam } from '@/interfaces/Exam';
import { fetchPublicExam, getExamId, formatExamDate, downloadExam, addExamToGoogleCalendar } from '@/utils/exam_utils';
import { onMounted, ref } from 'vue';
import '@material/web/button/outlined-button.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import '@material/web/icon/icon.js';
import type { StateObject } from '@/interfaces/SnackBar';
import { showSnackBar } from '@/utils/snackbar';
import SnackBar from '@/components/SnackBar.vue';
import type { MdMenuItem } from '@/interfaces/MdMenuItem';

const examDetails = ref<PublicExam>();
const examId = ref<string | null>();
const isLoading = ref<boolean>(true);
const examDownloadMessage = ref<string>();
const displaySb = ref<StateObject>({ visible: false });

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
        document.title = `Examination ${exam.name} | Examduler`
    } catch (error) {
        console.error('Error while fetching exams:', error);
    }

    isLoading.value = false;
}

async function triggerDownloadExam() {
    if (!examDetails.value) {
        console.error('Exam details is missing.');
        examDownloadMessage.value = 'No examination details found';
        showSnackBar(4000, displaySb.value);
        return;
    }

    const { message, success } = await downloadExam(examDetails.value);

    if (!success) {
        console.error('Failed to downloaded exam:', message);
        examDownloadMessage.value = message;
        showSnackBar(4000, displaySb.value);
        return;
    }

    console.log('Successfully downloaded exam');

    examDownloadMessage.value = 'Successfully downloaded examination';
    showSnackBar(4000, displaySb.value);
}

function triggerAddExamToGoogleCalendar() {
    if (!examDetails.value) {
        console.error('Exam details is missing.');
        examDownloadMessage.value = 'No examination details found';
        showSnackBar(4000, displaySb.value);
        return;
    }

    addExamToGoogleCalendar(examDetails.value);
}

function toggleMenu() {
    const downloadMenu = document.getElementById('download-menu');
    if (!downloadMenu) return;
    (downloadMenu as MdMenuItem).open = !(downloadMenu as MdMenuItem).open;
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
            <h1 class="exam-name">{{ examDetails.name }}</h1>
            <p class="exam-date">{{ formatExamDate(examDetails.date) }}</p>
            <p class="exam-description">{{ examDetails.description }}</p>
            <md-outlined-button v-vibrate id="download-button" class="download-button" @click="toggleMenu()">Add event</md-outlined-button>
            <md-menu anchor="download-button" id="download-menu" positioning="popover">
                <md-menu-item v-vibrate @click="triggerAddExamToGoogleCalendar()">
                    <div slot="headline">Add to Google Calendar</div>
                    <md-icon slot="start">calendar_add_on</md-icon>
                </md-menu-item>
                <md-menu-item v-vibrate @click="triggerDownloadExam()">
                    <div slot="headline">Download as event</div>
                    <md-icon slot="start">download</md-icon>
                </md-menu-item>
            </md-menu>
            <p class="examduler-footer">Powered by Examduler</p>
        </div>
        <div v-else-if="examId && !isLoading" class="exam-card not-found">
            <p>Exam with ID '{{ examId }}' not found.</p>
        </div>
        <div v-else-if="!isLoading" class="exam-card not-found">
            <p>No exam ID provided.</p>
        </div>
        <SnackBar :message="examDownloadMessage" :displayed="displaySb.visible"></SnackBar>
    </div>
</template>

<style scoped>
.content-wrapper {
    width: 100%;
    height: 100%;
}

.exam-card {
    position: fixed;
    top: 50dvh;
    left: 50dvw;
    transform: translate(-50%, -50%);
    text-align: center;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    width: 40dvw;
    height: 80dvh;
    border-radius: 25px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    box-sizing: border-box;
    padding: 20px;
    transition: box-shadow 0.3s ease;
}

.exam-card:hover {
    box-shadow: 0 10px 10px rgba(0, 0, 0, 0.5);
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
    top: 50dvh;
    left: 50dvw;
    transform: translate(-50%, -50%);
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
}

.download-button {
    position: absolute;
    bottom: 25px;
    left: 25px;
}

.examduler-footer {
    position: absolute;
    bottom: 25px;
    right: 25px;
}

.exam-description {
    width: 80%;
    overflow-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
}

@media (max-width: 768px) {
    .exam-card {
        width: 90dvw;
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