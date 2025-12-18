<script setup lang="ts">
import { ref } from 'vue';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import '@material/web/textfield/outlined-text-field.js';

import type { Organization } from '@/interfaces/Org';

import { vibrate } from '@/utils/vibrate';

const emit = defineEmits(['close']);

const organizationToCreate = ref<Organization>({
    name: '',
    domains: [],
    members: [],
});
const membersPicker = ref();

function closeDialog() {
    emit('close');
}

function addDomain() {
    organizationToCreate.value.domains.push('');
}

function deleteDomain(index: number) {
    organizationToCreate.value.domains.splice(index, 1);
}

function openFilePicker() {
    vibrate([10]);

    membersPicker.value.click();
}

/*

function handleFileUpload(e: Event) {
    const target = e.target as HTMLInputElement;

    if (!target.files) {
        console.error('No files found.');
        return;
    }

    const files = Array.from(target.files);

    for (const file of files) {
        const reader = new FileReader();

        reader.onload = function(event) {
            const result = event.target?.result;

            if (!result) {
                throw new Error('Failed to load result.');
            }

            if (typeof result !== 'string') {
                throw new Error('Result is not a string.');
            }
            
            const members = JSON.parse(result);


        }
    }
}

*/
</script>

<template>
    <div class="backdrop">
        <form class="dialog">
            <div class="top-panel">
                <md-icon-button type="button" @click="closeDialog()">
                    <md-icon>close</md-icon>
                </md-icon-button>
            </div>
            <h1 class="header-title">Create Organization</h1>
            <h2 class="subheader">General</h2>
            <md-outlined-text-field class="dialog-settings-field" v-model="organizationToCreate.name" label="Organization name" required no-asterisk="true" supporting-text="The name of the organization."> </md-outlined-text-field>
            <h2 class="subheader">Domains</h2>
            <div class="domains">
                <div class="domain-group" v-for="(_, index) in organizationToCreate.domains" :key="'domain' + index">
                    <md-outlined-text-field class="domain-input" v-model="organizationToCreate.domains[index]" :label="`Domain ${index + 1}`" required no-asterisk="true" supporting-text="A domain linked to the organization (without http:// or https:// prefix)."> </md-outlined-text-field>
                    <md-icon-button type="button" @click="deleteDomain(index)">
                        <md-icon>delete</md-icon>
                    </md-icon-button>
                </div>
            </div>
            <md-filled-button type="button" @click="addDomain()" class="domain-button">Add a domain</md-filled-button>
            <h2 class="subheader">Members</h2>
            <div class="pfp-input">
                <p>Your bot's profile picture</p>
                <label class="file-upload-button" tabindex="0" @click="openFilePicker()" @keyup.enter="openFilePicker()" @keyup.space="openFilePicker()">
                    <md-ripple></md-ripple>
                    <md-focus-ring style="--md-focus-ring-shape: 25px"></md-focus-ring>
                    <md-icon>upload</md-icon>
                </label>
                <input 
                    type="file"
                    ref="membersPicker"
                    name="members-json"
                    accept=".json"
                    
                    style="display: none;"
                    multiple>
            </div>
        </form>
    </div>
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

.header-title {
    font-size: 35px;
}

.subheader {
    font-size: 25px;
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
    margin: 10px 0;
}

.domain-button {
    margin: 10px 0;
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
</style>
