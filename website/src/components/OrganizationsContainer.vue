<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import OrganizationCreateContainer from './OrganizationCreateContainer.vue';
import OrganizationCard from './OrganizationCard.vue';
import type { Organization } from '@/interfaces/Org';
import { fetchAllOrganizations } from '@/utils/org_utils';
import LoaderContainer from './LoaderContainer.vue';
import OrganizationDialog from './OrganizationDialog.vue';
import type { StateObject } from '@/interfaces/SnackBar';
import { showSnackBar } from '@/utils/snackbar';
import SnackBar from './SnackBar.vue';
import { fetchCachedOrganizations } from '@/utils/cache_utils';

const organizations = ref<Organization[]>();
const orgsLoaded = ref<boolean>(false);
const orgDialogOpened = ref<boolean>(false);
const orgDetails = ref<Organization | null>(null);
const sbMessage = ref<string>();
const sbOpened = ref<StateObject>({ visible: false });

function displayOrgDialog(orgInfo: Organization) {
    orgDetails.value = orgInfo;
    orgDialogOpened.value = true;
}

function closeOrgDialog() {
    console.log('Organization dialog closing...');
    orgDialogOpened.value = false;
    orgDetails.value = null;
}

async function refreshOrgs(message: string | null) {
    if (message) {
        showSbMessage(message);
    }

    try {
        organizations.value = await fetchAllOrganizations();
        orgsLoaded.value = true;
    } catch (error) {
        console.error('Error while fetching all organizations:', error);
        const cachedOrgs = await fetchCachedOrganizations();
        organizations.value = cachedOrgs;
        orgsLoaded.value = true;
    }
}

function showSbMessage(message: string) {
    sbMessage.value = message;

    showSnackBar(4000, sbOpened.value);
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
    await refreshOrgs(null);
});
</script>

<template>
    <div class="content-wrapper">
        <h1 class="org-header">Your Organizations</h1>
        <div class="organizations" v-if="orgsLoaded && organizations?.length !== 0">
            <OrganizationCard v-for="(organization, index) in organizations" :key="'org' + index" v-bind="organization" @click="displayOrgDialog(organization)"></OrganizationCard>
        </div>
        <LoaderContainer v-else-if="!orgsLoaded" loading-text="Hang on while we load your organizations..." loader-color="var(--md-sys-color-primary)"></LoaderContainer>
        <OrganizationCreateContainer v-if="orgsLoaded" :has-organizations="organizations?.length !== 0" @refresh="refreshOrgs"></OrganizationCreateContainer>
        <OrganizationDialog v-if="orgDialogOpened && orgDetails" v-bind="orgDetails" @close="closeOrgDialog()" @success="refreshOrgs"></OrganizationDialog>
        <SnackBar :message="sbMessage" :displayed="sbOpened.visible"></SnackBar>
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: auto;
    gap: 10px;
    box-sizing: border-box;
    align-items: stretch;
    justify-content: stretch;
    width: 100%;
}

@media (max-width: 768px) {
    .organizations {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
    }
}
</style>
