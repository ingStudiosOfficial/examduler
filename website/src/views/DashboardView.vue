<script setup lang="ts">
import { onMounted, ref } from 'vue';

import '@material/web/fab/fab.js';

import ExaminationsContainer from '@/components/ExaminationsContainer.vue';
import OrganizationsContainer from '@/components/OrganizationsContainer.vue';
import ExaminationCreateDialog from '@/components/ExaminationCreateDialog.vue';
import LoaderContainer from '@/components/LoaderContainer.vue';
import SummaryContainer from '@/components/SummaryContainer.vue';

import type { User } from '@/interfaces/User';

import { fetchUserData } from '@/utils/user_utils';
import { fetchCachedUserData } from '@/utils/cache_utils';
import type { Exam } from '@/interfaces/Exam';
import { router } from '../router/index';
import ExaminationCreateMultipleDialog from '@/components/ExaminationCreateMultipleDialog.vue';
import { useDialog } from '@/composables/dialog_composables';
import { showSnackbar } from '@/utils/snackbar';

const { dialogOpened: examCreateDialogOpened, openDialog: openCreateExamDialog, closeDialog: closeCreateExamDialog } = useDialog();
const { dialogOpened: examCreateMultipleDialogOpened, openDialog: openCreateMultipleExamDialog, closeDialog: closeCreateMultipleExamDialog } = useDialog();

const userData = ref<User | null>(null);
const refreshExams = ref<boolean>(false);
const aiSummarySupported = ref<boolean>('Summarizer' in window);
const exams = ref<Exam[]>();

onMounted(async () => {
    try {
        userData.value = await fetchUserData();
    } catch (error) {
        console.error('Error while fetching user:', error);

        const cachedUserData = await fetchCachedUserData();
        if (!cachedUserData) router.push({ name: 'login' });
        else userData.value = cachedUserData;

        showSnackbar('You are currently offline. Viewing read-only cached data.', 4000);
    }
});

function onSummaryError(message: string) {
    showSnackbar(message, 4000);
}

function alertRefreshExams() {
    refreshExams.value = true;
}

function onFetchExams(fetchedExams: Exam[]) {
    exams.value = fetchedExams;
}
</script>

<template>
    <div v-if="userData" class="dashboard-wrapper">
        <SummaryContainer v-if="aiSummarySupported && exams" :exams="exams" :user="userData" @error="onSummaryError"></SummaryContainer>

        <ExaminationsContainer :user="userData" :refresh="refreshExams" @fetched-exams="onFetchExams"></ExaminationsContainer>

        <OrganizationsContainer v-if="userData.role === 'admin'"></OrganizationsContainer>

        <ExaminationCreateDialog v-if="(userData.role === 'admin' || userData.role === 'teacher') && examCreateDialogOpened" @close="closeCreateExamDialog()" @success="alertRefreshExams()" @multiple="openCreateMultipleExamDialog()"></ExaminationCreateDialog>
        <ExaminationCreateMultipleDialog v-if="(userData.role === 'admin' || userData.role === 'teacher') && examCreateMultipleDialogOpened" @close="closeCreateMultipleExamDialog()" @success="alertRefreshExams()" @single="openCreateExamDialog()"></ExaminationCreateMultipleDialog>

        <md-fab v-if="userData.role === 'teacher' || userData.role === 'admin'" class="add-button" label="Create" size="medium" v-vibrate @click="openCreateExamDialog()">
            <md-icon slot="icon">add</md-icon>
        </md-fab>
        <md-fab v-if="userData.role === 'teacher' || userData.role === 'admin'" class="mobile-add-button" size="large" v-vibrate @click="openCreateExamDialog()">
            <md-icon slot="icon">add</md-icon>
        </md-fab>
    </div>

    <LoaderContainer v-else class="loader-container" loading-text="Hang on while we load the neccessary data..." loader-color="var(--md-sys-color-primary)"></LoaderContainer>
</template>

<style scoped>
.dashboard-wrapper {
    width: 100%;
    box-sizing: border-box;
    overflow: visible;
    position: relative;
    min-height: 100%;
    display: flex;
    flex-direction: column;
}

.loader-container {
    position: fixed;
    top: 50dvh;
    left: 50dvw;
    transform: translate(-50%, -50%);
}

.add-button {
    position: fixed;
    bottom: 25px;
    right: 25px;
}

.mobile-add-button {
    display: none;
}

@media (max-width: 768px) {
    .add-button {
        display: none;
    }

    .mobile-add-button {
        display: block;
        position: fixed;
        bottom: calc(10dvh + 25px);
        right: 25px;
    }
}
</style>
