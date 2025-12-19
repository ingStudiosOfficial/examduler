<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import '@material/web/fab/fab.js';

import ExaminationsContainer from '@/components/ExaminationsContainer.vue';
//import OrganizationContainer from '@/components/OrganizationContainer.vue';
import ExaminationCreateDialog from '@/components/ExaminationCreateDialog.vue';
import LoaderContainer from '@/components/LoaderContainer.vue';

import type { User } from '@/interfaces/User';

import { fetchUserData } from '@/utils/user_utils';

const userData = ref<User | null>(null);
const examCreateDialogOpened = ref<boolean>(false);

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
    // Function to call the child exam component to refresh exams
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
        <ExaminationsContainer :user="userData"></ExaminationsContainer>

        <!--
        Add on in the future update - pause on this
        <OrganizationContainer v-if="userData.role === 'admin'"></OrganizationContainer>
        -->

        <ExaminationCreateDialog v-if="userData.role === 'admin' || userData.role === 'teacher'" v-show="examCreateDialogOpened" @close="closeCreateExamDialog()" @success="alertRefreshExams()"></ExaminationCreateDialog>

        <md-fab class="add-button" label="Create" @click="openCreateExamDialog()">
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
    top: 50vh;
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
