<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import type { Organization, OrganizationEdit } from '@/interfaces/Org';
import { copyVerificationToken, downloadMembersJson } from '@/utils/org_utils';
import { vibrate } from '@/utils/vibrate';

import SnackBar from './SnackBar.vue';
import { showSnackBar } from '@/utils/snackbar';
import type { StateObject } from '@/interfaces/SnackBar';

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

async function triggerCopyToken(token: string) {
    vibrate([10]);

    snackBarText.value = await copyVerificationToken(token);

    showSnackBar(4000, snackBarDisplayed.value);
}

watch(props, (newOrg) => {
    loadedOrganization.value = newOrg;
});

onMounted(() => {
    loadedOrganization.value = props;
});
</script>

<template>
    <div class="backdrop" v-if="loadedOrganization">
        <div class="dialog">
            <div class="top-panel">
                <md-icon-button @click="closeDialog()">
                    <md-icon>close</md-icon>
                </md-icon-button>
            </div>
            <h1 class="org-name">{{ loadedOrganization.name }}</h1>
            <h2 class="subheader">Domains</h2>
            <div class="domains">
                <div class="domain-group" v-for="(domain, index) in loadedOrganization.domains" :key="'domain' + index">
                    <md-outlined-text-field v-if="loadedOrganization.domains[index]" class="domain-input" v-model="loadedOrganization.domains[index].domain" :label="`Domain ${index + 1}`" required no-asterisk="true" supporting-text="A domain linked to the organization."></md-outlined-text-field>
                    <md-icon-button type="button" @click="triggerCopyToken(domain.verificationToken)">
                        <md-icon>content_copy</md-icon>
                    </md-icon-button>
                    <md-icon-button type="button" @click="deleteDomain(index)">
                        <md-icon>domain_verification</md-icon>
                    </md-icon-button>
                    <md-icon-button type="button" @click="deleteDomain(index)">
                        <md-icon>delete</md-icon>
                    </md-icon-button>
                </div>
            </div>
            <h2 class="subheader">Members</h2>
            <div class="members-output">
                <p>Download members</p>
                <label class="file-download-button" tabindex="0" @click="downloadMembersJson(loadedOrganization.members)" @keyup.enter="downloadMembersJson(loadedOrganization.members)" @keyup.space="downloadMembersJson(loadedOrganization.members)">
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

.org-name {
    font-size: 35px;
}

.subheader {
    font-size: 25px;
}

.domains {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    width: 100%;
}

.domain-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 40%;
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