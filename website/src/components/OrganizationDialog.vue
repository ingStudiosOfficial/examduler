<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/fab/fab.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';

import type { Organization, OrganizationEdit } from '@/interfaces/Org';
import { deleteOrganization, downloadMembersJson, editOrganization } from '@/utils/org_utils';


import SnackBar from './SnackBar.vue';
import DomainItem from './DomainItem.vue';

import { showSnackBar } from '@/utils/snackbar';
import type { StateObject } from '@/interfaces/SnackBar';
import type { Member } from '@/interfaces/Member';
import type { Domain } from '@/interfaces/Domain';
import { DialogUtils } from '@/utils/dialog_utils';

const props = defineProps<Organization>();

const emit = defineEmits<{ (e: 'close'): void, (e: 'success', message: string): void }>();

const loadedOrganization = ref<OrganizationEdit>();
const membersPicker = ref();
const uploadedMembersName = ref<string>();
const snackBarText = ref<string>();
const snackBarDisplayed = ref<StateObject>({ visible: false });
const submitButton = ref();
const orgEditMessage = ref<string>();
const orgEditSuccess = ref<boolean>(false);

function closeDialog() {
    emit('close');
}

function deleteDomain(index: number) {
    console.log('Index:', index);
    console.log('Org before splice:', loadedOrganization.value?.domains);
    loadedOrganization.value?.domains.splice(index, 1);
    console.log('Org after splice:', loadedOrganization.value?.domains);
}

function openFilePicker() {
    membersPicker.value.click();
}

function handleFileUpload(e: Event) {
    const target = e.target as HTMLInputElement;

    if (!target.files || target.files?.length === 0) {
        console.error('No uploaded files found.');
        return;
    }

    const uploadedFile = target.files[0];

    if (!uploadedFile) {
        console.error('File missing.');
        return;
    }

    const reader = new FileReader();

    reader.onload = (ef) => {
        if (!ef.target?.result) {
            console.error('Failed to read file.');
            return;
        }

        if (typeof ef.target.result !== 'string') {
            console.error('File content is not a string.');
            return;
        }

        console.log('Read result:', ef.target.result);

        if (!loadedOrganization.value) {
            console.error('Loaded organization is undefined.');
            return;
        }

        loadedOrganization.value.uploadedMembers = ef.target.result;
        loadedOrganization.value.memberUploaded = true;
    };

    reader.readAsText(uploadedFile);

    uploadedMembersName.value = uploadedFile.name;
}

async function triggerDownloadMembers(members: Member[]) {
    const { message } = await downloadMembersJson(members);

    snackBarText.value = message;
    showSnackBar(4000, snackBarDisplayed.value);
}

function updateDomainState(domain: Domain, index: number) {
    if (!loadedOrganization.value) return;

    loadedOrganization.value.domains[index] = domain;
}

function triggerShowSnackBar(sbText: string) {
    snackBarText.value = sbText;
    showSnackBar(4000, snackBarDisplayed.value);
}

function addDomain() {
    if (!loadedOrganization.value) return;

    loadedOrganization.value.domains.push({
        keyId: window.crypto.randomUUID(),
        domain: '',
        verificationToken: '',
        verified: false,
    });
}

function pressOrgSubmit() {
    submitButton.value.click();
}

async function orgFormSubmit() {
    if (!loadedOrganization.value) return;

    const { message, success } = await editOrganization(loadedOrganization.value);
    console.log(message);

    orgEditMessage.value = message;
    orgEditSuccess.value = success;

    if (success) {
        closeDialog();
        emit('success', orgEditMessage.value);
    }
}

async function triggerDeleteOrg() {
    if (!(await DialogUtils.confirm(`Are you sure you want to delete the organization '${loadedOrganization.value?.name}'? This action is irreversible and will delete all members and domains.`, 'Delete Organization'))) return;

    if (!loadedOrganization.value?._id) return;

    const { message, success } = await deleteOrganization(loadedOrganization.value._id);

    if (!success) {
        triggerShowSnackBar(message);
        return;
    }

    emit('success', message);
    closeDialog();
}

watch(props, (newOrg) => {
    loadedOrganization.value = window.structuredClone(newOrg);
});

onMounted(() => {
    loadedOrganization.value = {
        ...props,
        domains: props.domains.map(d => ({
            ...d,
            keyId: window.crypto.randomUUID(),
        })),
        memberUploaded: false,
    };
});
</script>

<template>
    <div class="backdrop" v-if="loadedOrganization && loadedOrganization._id">
        <form class="dialog" @submit.prevent="orgFormSubmit()">
            <div class="top-panel">
                <div class="left-buttons">
                    <md-icon-button type="button" v-vibrate @click="triggerDeleteOrg()">
                        <md-icon>delete</md-icon>
                    </md-icon-button>
                </div>
                <div class="right-buttons">
                    <md-icon-button type="button" v-vibrate @click="closeDialog()">
                        <md-icon>close</md-icon>
                    </md-icon-button>
                </div>
            </div>
            <h1 class="org-header">Edit Organization</h1>
            <h2 class="subheader">Name</h2>
            <md-outlined-text-field class="dialog-settings-field" v-model="loadedOrganization.name" label="Organization name" required no-asterisk="true" supporting-text="The name of the organization." maxlength="50"></md-outlined-text-field>
            <h2 class="subheader">Domains</h2>
            <div class="domains">
                <DomainItem v-for="(domain, index) in loadedOrganization.domains" :key="domain.keyId" :domain="domain" :index="index" :org-id="loadedOrganization._id" :key-id="domain.keyId" @domain-change="updateDomainState" @display-snack-bar="triggerShowSnackBar" @delete-domain="deleteDomain"></DomainItem>
                <md-filled-button v-vibrate type="button" @click="addDomain()" class="domain-button">Add a domain</md-filled-button>
            </div>
            <h2 class="subheader">Members</h2>
            <p>{{ loadedOrganization.members.length }} members</p>
            <div class="file-input">
                <p>Download members</p>
                <label v-vibrate class="file-upload-button" tabindex="0" @click="triggerDownloadMembers(loadedOrganization.members)" @keyup.enter="downloadMembersJson(loadedOrganization.members)" @keyup.space="downloadMembersJson(loadedOrganization.members)">
                    <md-ripple></md-ripple>
                    <md-focus-ring style="--md-focus-ring-shape: 25px"></md-focus-ring>
                    <md-icon>download</md-icon>
                </label>
            </div>
            <div class="file-input">
                <p>Upload members</p>
                <label v-vibrate class="file-upload-button" tabindex="0" @click="openFilePicker()" @keyup.enter="openFilePicker()" @keyup.space="openFilePicker()">
                    <md-ripple></md-ripple>
                    <md-focus-ring style="--md-focus-ring-shape: 25px"></md-focus-ring>
                    <md-icon>upload</md-icon>
                </label>
                <input type="file" ref="membersPicker" name="members-csv" accept=".csv" style="display: none" multiple @change="handleFileUpload" />
                <p class="file-chosen">{{ uploadedMembersName }}</p>
            </div>
            <p :style="{ color: orgEditSuccess ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-error)' }">{{ orgEditMessage }}</p>
            <button class="hidden-submit" type="submit" ref="submitButton"></button>
            <md-fab class="submit-button" @click="pressOrgSubmit()">
                <md-icon slot="icon">check</md-icon>
            </md-fab>
        </form>

        <SnackBar :message="snackBarText || 'Unknown message'" :displayed="snackBarDisplayed.visible"></SnackBar>
    </div>
</template>

<style scoped>
.top-panel {
    position: sticky;
    background-color: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    top: 0;
    left: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    box-sizing: border-box;
    width: 100%;
    border-bottom: 1px solid var(--md-sys-color-outline);
    z-index: 1001;
    text-align: center;
}

.right-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
}

.left-buttons {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
}

.org-header {
    font-size: 2em;
    color: var(--md-sys-color-primary);
}

.subheader {
    font-size: 1.7em;
    color: var(--md-sys-color-primary);
}

.domains {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
}

.submit-button {
    position: sticky;
    bottom: 25px;
    right: 25px;
    z-index: 1001;
    display: block;
    margin-left: auto;
}

.hidden-submit {
    display: none;
}
</style>