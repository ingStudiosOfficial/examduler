<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import '@material/web/fab/fab.js';

import ExaminationsContainer from '@/components/ExaminationsContainer.vue';
import OrganizationsContainer from '@/components/OrganizationsContainer.vue';
import ExaminationCreateDialog from '@/components/ExaminationCreateDialog.vue';
import LoaderContainer from '@/components/LoaderContainer.vue';

import type { User } from '@/interfaces/User';

import { fetchUserData } from '@/utils/user_utils';

const userData = ref<User | null>(null);
const examCreateDialogOpened = ref<boolean>(false);
const refreshExams = ref<boolean>(false);
const windowWidth = ref<number>(window.innerWidth);

onMounted(async () => {
    try {
        userData.value = await fetchUserData();
    } catch (error) {
        console.error('Error while fetching user:', error);
    }
});

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
    <div v-if="userData" class="content-wrapper">
        <ExaminationsContainer :user="userData" :refresh="refreshExams"></ExaminationsContainer>

        <OrganizationsContainer v-if="userData.role === 'admin'"></OrganizationsContainer>

        <ExaminationCreateDialog v-if="(userData.role === 'admin' || userData.role === 'teacher') && examCreateDialogOpened" @close="closeCreateExamDialog()" @success="alertRefreshExams()"></ExaminationCreateDialog>

        <md-fab v-if="userData.role === 'teacher' || userData.role === 'admin'" class="add-button" :label="windowWidth > 768 ? 'Create' : ''" :size="windowWidth > 768 ? 'medium' : 'large'" v-vibrate @click="openCreateExamDialog()">
            <md-icon slot="icon">add</md-icon>
        </md-fab>
    </div>

    <LoaderContainer v-else class="loader-container" loading-text="Hang on while we load the neccessary data..." loader-color="var(--md-sys-color-primary)"></LoaderContainer>
</template>

<style scoped>
.content-wrapper {
    width: 100%;
    box-sizing: border-box;
    overflow: visible;
}

.loader-container {
    position: fixed;
    top: 50dvh;
    left: 50vw;
    transform: translate(-50%, -50%);
}

.add-button {
    position: fixed;
    margin: 25px;
    bottom: 0;
    right: 0;
}
</style>
