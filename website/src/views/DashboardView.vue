<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import '@material/web/fab/fab.js';

import ExaminationsContainer from '@/components/ExaminationsContainer.vue';
import OrganizationsContainer from '@/components/OrganizationsContainer.vue';
import ExaminationCreateDialog from '@/components/ExaminationCreateDialog.vue';
import LoaderContainer from '@/components/LoaderContainer.vue';
import SummaryContainer from '@/components/SummaryContainer.vue';

import type { User } from '@/interfaces/User';

import { fetchUserData } from '@/utils/user_utils';
import { fetchCachedUserData } from '@/utils/cache_utils';
import SnackBar from '@/components/SnackBar.vue';
import type { StateObject } from '@/interfaces/SnackBar';
import { showSnackBar } from '@/utils/snackbar';
import type { Exam } from '@/interfaces/Exam';
import { router } from '../router/index';

const userData = ref<User | null>(null);
const examCreateDialogOpened = ref<boolean>(false);
const refreshExams = ref<boolean>(false);
const sbMessage = ref<string>();
const sbOpened = ref<StateObject>({ visible: false });
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

        sbMessage.value = 'You are currently offline. Viewing read-only cached data.';
        showSnackBar(4000, sbOpened.value);
    }
});

function onSummaryError(message: string) {
    sbMessage.value = message;
    showSnackBar(4000, sbOpened.value);
}

function openCreateExamDialog() {
    examCreateDialogOpened.value = true;
}

function closeCreateExamDialog() {
    console.log('Exam create dialog closing...');
    examCreateDialogOpened.value = false;
}

function alertRefreshExams() {
    refreshExams.value = true;
}

function onFetchExams(fetchedExams: Exam[]) {
    exams.value = fetchedExams;
}

watch(examCreateDialogOpened, (isOpen: boolean) => {
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeCreateExamDialog();
    };

    if (isOpen) {
        document.addEventListener('keydown', handleEscape);
    }

    return () => document.addEventListener('keydown', handleEscape);
});
</script>

<template>
    <div v-if="userData" class="dashboard-wrapper">
        <SummaryContainer v-if="aiSummarySupported && exams" :exams="exams" :user="userData" @error="onSummaryError"></SummaryContainer>

        <ExaminationsContainer :user="userData" :refresh="refreshExams" @fetched-exams="onFetchExams"></ExaminationsContainer>

        <OrganizationsContainer v-if="userData.role === 'admin'"></OrganizationsContainer>

        <ExaminationCreateDialog v-if="(userData.role === 'admin' || userData.role === 'teacher') && examCreateDialogOpened" @close="closeCreateExamDialog()" @success="alertRefreshExams()"></ExaminationCreateDialog>

        <md-fab v-if="userData.role === 'teacher' || userData.role === 'admin'" class="add-button" label="Create" size="medium" v-vibrate @click="openCreateExamDialog()">
            <md-icon slot="icon">add</md-icon>
        </md-fab>
        <md-fab v-if="userData.role === 'teacher' || userData.role === 'admin'" class="mobile-add-button" size="large" v-vibrate @click="openCreateExamDialog()">
            <md-icon slot="icon">add</md-icon>
        </md-fab>
    </div>

    <LoaderContainer v-else class="loader-container" loading-text="Hang on while we load the neccessary data..." loader-color="var(--md-sys-color-primary)"></LoaderContainer>

    <SnackBar :message="sbMessage" :displayed="sbOpened.visible"></SnackBar>
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
    display: block;
    position: sticky;
    align-self: flex-end;
    bottom: 25px;
    right: 25px;
    margin-top: auto;
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
        position: sticky;
        align-self: flex-end;
        bottom: 25px;
        right: 25px;
        margin-top: auto;
    }
}
</style>
