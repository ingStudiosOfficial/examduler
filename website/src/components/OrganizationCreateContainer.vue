<script setup lang="ts">
import { ref, watch } from 'vue';

import '@material/web/button/filled-button.js';

import OrganizationCreateDialog from './OrganizationCreateDialog.vue';

const props = defineProps({
    hasOrganizations: Boolean,
});

const emit = defineEmits<{ (e: 'refresh', message: string): void }>();

const dialogOpened = ref<boolean>(false);

function openCreateOrgDialog() {
    dialogOpened.value = true;
}

function closeCreateOrgDialog() {
    dialogOpened.value = false;
}

function emitRefresh(message: string) {
    emit('refresh', message);
}

watch(dialogOpened, (isOpen: boolean) => {
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeCreateOrgDialog();
    };

    if (isOpen) {
        document.addEventListener('keydown', handleEscape);
    }

    return () => document.addEventListener('keydown', handleEscape);
});
</script>

<template>
    <p class="no-org-text" v-if="!props.hasOrganizations">You don't look like you have any organizations yet.</p>
    <md-filled-button class="org-create-btn" @click="openCreateOrgDialog()">Create an organization</md-filled-button>
    <OrganizationCreateDialog v-if="dialogOpened" @close="closeCreateOrgDialog()" @success="emitRefresh"></OrganizationCreateDialog>
</template>

<style scoped>
.content-wrapper {
    padding: 0;
    margin: 0;
}

.org-create-btn {
    margin: 10px 0;
}
</style>
