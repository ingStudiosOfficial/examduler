<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/fab/fab.js';
import '@material/web/menu/menu.js';

import type { Organization, OrganizationEdit } from '@/interfaces/Org';
import { downloadMembersJson } from '@/utils/org_utils';
import { vibrate } from '@/utils/vibrate';

import SnackBar from './SnackBar.vue';
import DomainItem from './DomainItem.vue';

import { showSnackBar } from '@/utils/snackbar';
import type { StateObject } from '@/interfaces/SnackBar';
import type { Member } from '@/interfaces/Member';
import type { Domain } from '@/interfaces/Domain';

const props = defineProps<Organization>();

const emit = defineEmits(['close']);

const loadedOrganization = ref<OrganizationEdit>();
const membersPicker = ref();
const uploadedMembersName = ref<string>();
const snackBarText = ref<string>();
const snackBarDisplayed = ref<StateObject>({ visible: false });

function closeDialog() {
    emit('close');
}

function deleteDomain(index: number) {
    loadedOrganization.value?.domains.splice(index, 1)
}

function openFilePicker() {
    vibrate([10]);

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
        domain: '',
        verificationToken: '',
        verified: false,
    });
}

watch(props, (newOrg) => {
    loadedOrganization.value = newOrg;
});

onMounted(() => {
    loadedOrganization.value = props;
});
</script>

<template>
    <div class="backdrop" v-if="loadedOrganization && loadedOrganization._id">
        <div class="dialog">
            <div class="top-panel">
                <md-icon-button @click="closeDialog()">
                    <md-icon>close</md-icon>
                </md-icon-button>
            </div>
            <h1 class="org-header">Edit Organization</h1>
            <h2 class="subheader">Name</h2>
            <md-outlined-text-field class="dialog-settings-field" v-model="loadedOrganization.name" label="Organization name" required no-asterisk="true" supporting-text="The name of the organization."></md-outlined-text-field>
            <h2 class="subheader">Domains</h2>
            <div class="domains">
                <DomainItem v-for="(domain, index) in loadedOrganization.domains" :key="`domain${index}`" :domain="domain" :index="index" :org-id="loadedOrganization._id" @domain-change="updateDomainState" @display-snack-bar="triggerShowSnackBar" @delete-domain="deleteDomain"></DomainItem>
                <md-filled-button type="button" @click="addDomain()" class="domain-button">Add a domain</md-filled-button>
            </div>
            <h2 class="subheader">Members</h2>
            <div class="members-output">
                <p>Download members</p>
                <label class="file-download-button" tabindex="0" @click="triggerDownloadMembers(loadedOrganization.members)" @keyup.enter="downloadMembersJson(loadedOrganization.members)" @keyup.space="downloadMembersJson(loadedOrganization.members)">
                    <md-ripple></md-ripple>
                    <md-focus-ring style="--md-focus-ring-shape: 25px"></md-focus-ring>
                    <md-icon>download</md-icon>
                </label>
            </div>
            <div class="members-input">
                <p>Upload members</p>
                <label class="file-upload-button" tabindex="0" @click="openFilePicker()" @keyup.enter="openFilePicker()" @keyup.space="openFilePicker()">
                    <md-ripple></md-ripple>
                    <md-focus-ring style="--md-focus-ring-shape: 25px"></md-focus-ring>
                    <md-icon>upload</md-icon>
                </label>
                <input type="file" ref="membersPicker" name="members-csv" accept=".csv" style="display: none" multiple @change="handleFileUpload" />
                <p class="file-chosen">{{ uploadedMembersName }}</p>
            </div>
        </div>
    </div>
    <SnackBar :message="snackBarText" :displayed="snackBarDisplayed.visible"></SnackBar>
</template>

<style scoped>
.backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: auto;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

.dialog {
    width: 75vw;
    height: 75vh;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    border-radius: 25px;
    overflow-y: scroll;
    box-sizing: border-box;
    overflow-x: hidden;
    z-index: 1000;
    position: relative;
    gap: 20px;
}

.dialog * {
    margin: 0;
}

.dialog-settings-field {
    width: 40%;
    color: var(--md-sys-color-on-primary-container);
}

.section-header {
    font-size: 25px;
}

.top-panel {
    position: sticky;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-secondary-container);
    top: 0;
    left: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding: 10px;
    box-sizing: border-box;
    width: 100%;
    border-bottom: 1px solid var(--md-sys-color-outline);
    z-index: 1001;
}

.org-header {
    font-size: 35px;
}

.subheader {
    font-size: 25px;
}

.domains {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
}

.domain-input {
    width: 60%;
}

.members-output, .members-input {
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
    border-radius: 25px;
    padding: 20px;
    gap: 10px;
    width: 40%;
    box-sizing: border-box;
}

.file-download-button, .file-upload-button {
    display: block;
    position: relative;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    padding: 10px;
    border-radius: 25px;
    cursor: pointer;
    display: inline-block;
    box-sizing: border-box;
    text-align: center;
    height: 50px;
    outline: none;
}
</style>