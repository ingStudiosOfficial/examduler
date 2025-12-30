<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import OrganizationCreateContainer from './OrganizationCreateContainer.vue';
import OrganizationCard from './OrganizationCard.vue';
import type { Organization } from '@/interfaces/Org';
import { fetchAllOrganizations } from '@/utils/org_utils';
import LoaderContainer from './LoaderContainer.vue';
import OrganizationDialog from './OrganizationDialog.vue';

const organizations = ref<Organization[]>();
const orgsLoaded = ref<boolean>(false);

const orgDialogOpened = ref<boolean>(false);
const orgDetails = ref<Organization | null>(null);

function displayOrgDialog(orgInfo: Organization) {
    orgDetails.value = orgInfo;
    orgDialogOpened.value = true;
}

function closeOrgDialog() {
    console.log('Organization dialog closing...');
    orgDialogOpened.value = false;
    orgDetails.value = null;
}

watch(orgDialogOpened, (isOpen: boolean) => {
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeOrgDialog();
    };

    if (isOpen) {
        document.addEventListener('keydown', handleEscape);
    }

    return () => document.addEventListener('keydown', handleEscape);
});

onMounted(async () => {
    try {
        organizations.value = await fetchAllOrganizations();
        orgsLoaded.value = true;
    } catch (error) {
        console.error('Error while fetching all organizations:', error);
        orgsLoaded.value = false;
    }
});
</script>

<template>
    <div class="content-wrapper">
        <h1 class="org-header">Your Organizations</h1>
        <div class="organizations" v-if="orgsLoaded && organizations?.length !== 0">
            <OrganizationCard v-for="(organization, index) in organizations" :key="'org' + index" v-bind="organization" @click="displayOrgDialog(organization)"></OrganizationCard>
        </div>
        <LoaderContainer v-else-if="!orgsLoaded" loading-text="Hang on while we load your organizations..." loader-color="var(--md-sys-color-primary)"></LoaderContainer>
        <OrganizationCreateContainer v-if="orgsLoaded" :has-organizations="organizations?.length !== 0"></OrganizationCreateContainer>
        <OrganizationDialog v-if="orgDialogOpened && orgDetails" v-bind="orgDetails" @close="closeOrgDialog()"></OrganizationDialog>
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

.org-header {
    color: var(--md-sys-color-primary);
}

.organizations {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto;
    gap: 10px;
    box-sizing: border-box;
    align-items: stretch;
    justify-content: stretch;
    width: 100%;
}
</style>
