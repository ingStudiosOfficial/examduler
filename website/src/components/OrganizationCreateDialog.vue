<script setup lang="ts">
import { ref } from 'vue';

import '@m3e/web/icon-button';
import '@m3e/web/icon';
import '@material/web/textfield/outlined-text-field.js';
import '@m3e/web/fab';
import '@m3e/web/button';

import type { OrganizationCreate } from '@/interfaces/Org';

import { createOrganization } from '@/utils/org_utils';
import { vibrate } from '@/utils/vibrate';

const emit = defineEmits<{ (e: 'close'): void; (e: 'success', message: string): void }>();

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
        vibrate('success');
        emit('success', orgCreationMessage.value);
        closeDialog();
    } else {
        vibrate('error');
    }
}
</script>

<template>
    <div class="backdrop">
        <form class="dialog" @submit.prevent="orgFormSubmit()">
            <div class="top-panel">
                <m3e-icon-button v-vibrate @click="closeDialog()">
                    <m3e-icon name="close"></m3e-icon>
                </m3e-icon-button>
            </div>
            <h1 class="header-title">Create Organization</h1>
            <h2 class="subheader">General</h2>
            <md-outlined-text-field class="dialog-settings-field" v-model="organizationToCreate.name" label="Organization name" required no-asterisk="true" supporting-text="The name of the organization." maxlength="50"></md-outlined-text-field>
            <h2 class="subheader">Domains</h2>
            <div class="domains">
                <div class="domain-group" v-for="(_, index) in organizationToCreate.domains" :key="'domain' + index">
                    <md-outlined-text-field class="domain-input" v-if="organizationToCreate.domains[index]" v-model="organizationToCreate.domains[index].domain" :label="`Domain ${index + 1}`" required no-asterisk="true" supporting-text="A domain linked to the organization."></md-outlined-text-field>
                    <m3e-icon-button v-vibrate type="button" @click="deleteDomain(index)">
                        <m3e-icon name="delete"></m3e-icon>
                    </m3e-icon-button>
                </div>
            </div>
            <m3e-button v-vibrate type="button" @click="addDomain()" class="domain-button" variant="filled">Add a domain</m3e-button>
            <h2 class="subheader">Members</h2>
            <div class="file-input">
                <p>Your members</p>
                <label v-vibrate class="file-upload-button" tabindex="0" @click="openFilePicker()" @keyup.enter="openFilePicker()" @keyup.space="openFilePicker()">
                    <md-ripple></md-ripple>
                    <md-focus-ring style="--md-focus-ring-shape: 25px"></md-focus-ring>
                    <m3e-icon name="upload"></m3e-icon>
                </label>
                <input type="file" ref="membersPicker" name="members-csv" accept=".csv" style="display: none" @change="handleFileUpload" />
                <p class="file-chosen">{{ uploadedMembersName }}</p>
            </div>
            <p :style="{ color: orgCreationSuccess ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-error)' }">{{ orgCreationMessage }}</p>
            <button class="hidden-submit" type="submit" ref="submitButton"></button>
            <m3e-fab size="small" class="submit-button" @click="pressOrgSubmit()">
                <m3e-icon name="check"></m3e-icon>
            </m3e-fab>
        </form>
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

.file-chosen {
    word-wrap: break-word;
}

.hidden-submit {
    display: none;
}

@media (max-width: 768px) {
    .domain-group {
        width: 80%;
    }
}
</style>
