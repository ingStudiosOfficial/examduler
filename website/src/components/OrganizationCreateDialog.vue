<script setup lang="ts">
import { ref } from 'vue';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/fab/fab.js';

import type { OrganizationCreate } from '@/interfaces/Org';

import { createOrganization } from '@/utils/org_utils';

const emit = defineEmits<{ (e: 'close'): void, (e: 'success', message: string): void }>();

const organizationToCreate = ref<OrganizationCreate>({
    name: '',
    domains: [],
    members: '',
});
const membersPicker = ref();
const submitButton = ref();
const uploadedMembersName = ref<string>();
const orgCreationMessage = ref<string>();
const orgCreationSuccess = ref<boolean>(false);

function closeDialog() {
    emit('close');
}

function addDomain() {
    organizationToCreate.value.domains.push({
        domain: '',
        verificationToken: '',
        verified: false,
    });
}

function deleteDomain(index: number) {
    organizationToCreate.value.domains.splice(index, 1);
}

function openFilePicker() {
    membersPicker.value.click();
}

function pressOrgSubmit() {
    submitButton.value.click();
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

        organizationToCreate.value.members = ef.target.result;
    };

    reader.readAsText(uploadedFile);

    uploadedMembersName.value = uploadedFile.name;
}

async function orgFormSubmit() {
    const { message, success } = await createOrganization(organizationToCreate.value);
    console.log(message);

    orgCreationMessage.value = message;
    orgCreationSuccess.value = success;

    if (success) {
        closeDialog();
        emit('success', orgCreationMessage.value);
    }
}
</script>

<template>
    <div class="backdrop">
        <form class="dialog" @submit.prevent="orgFormSubmit()">
            <div class="top-panel">
                <md-icon-button v-vibrate @click="closeDialog()">
                    <md-icon>close</md-icon>
                </md-icon-button>
            </div>
            <h1 class="header-title">Create Organization</h1>
            <h2 class="subheader">General</h2>
            <md-outlined-text-field class="dialog-settings-field" v-model="organizationToCreate.name" label="Organization name" required no-asterisk="true" supporting-text="The name of the organization." maxlength="50"></md-outlined-text-field>
            <h2 class="subheader">Domains</h2>
            <div class="domains">
                <div class="domain-group" v-for="(_, index) in organizationToCreate.domains" :key="'domain' + index">
                    <md-outlined-text-field class="domain-input" v-if="organizationToCreate.domains[index]" v-model="organizationToCreate.domains[index].domain" :label="`Domain ${index + 1}`" required no-asterisk="true" supporting-text="A domain linked to the organization."></md-outlined-text-field>
                    <md-icon-button @click="deleteDomain(index)">
                        <md-icon>delete</md-icon>
                    </md-icon-button>
                </div>
            </div>
            <md-filled-button @click="addDomain()" class="domain-button">Add a domain</md-filled-button>
            <h2 class="subheader">Members</h2>
            <div class="members-input">
                <p>Your members</p>
                <label class="file-upload-button" tabindex="0" @click="openFilePicker()" @keyup.enter="openFilePicker()" @keyup.space="openFilePicker()">
                    <md-ripple></md-ripple>
                    <md-focus-ring style="--md-focus-ring-shape: 25px"></md-focus-ring>
                    <md-icon>upload</md-icon>
                </label>
                <input type="file" ref="membersPicker" name="members-csv" accept=".csv" style="display: none" multiple @change="handleFileUpload" />
                <p class="file-chosen">{{ uploadedMembersName }}</p>
            </div>
            <p :style="{ color: orgCreationSuccess ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-error)' }">{{ orgCreationMessage }}</p>
            <button class="hidden-submit" type="submit" ref="submitButton"></button>
            <md-fab class="submit-button" @click="pressOrgSubmit()">
                <md-icon slot="icon">check</md-icon>
            </md-fab>
        </form>
    </div>
</template>

<style scoped>
.backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: auto;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

.dialog {
    width: 75vw;
    height: 75dvh;
    background-color: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
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

.top-panel {
    position: sticky;
    background-color: var(--md-sys-color-surface);
    color: var(--md-sys-color-on-surface);
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
    text-align: center;
}

.header-title {
    font-size: 2em;
    color: var(--md-sys-color-primary);
}

.subheader {
    font-size: 1.7em;
    color: var(--md-sys-color-primary);
}

.dialog-settings-field {
    width: 40%;
    color: var(--md-sys-color-on-primary-container);
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
    width: 80%;
}

.members-input {
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface-container);
    border-radius: 25px;
    padding: 20px;
    gap: 10px;
    width: 40%;
    box-sizing: border-box;
}

.file-upload-button {
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

.file-chosen {
    word-wrap: break-word;
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
