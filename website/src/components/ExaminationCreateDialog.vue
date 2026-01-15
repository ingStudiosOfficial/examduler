<script setup lang="ts">
import { ref, watch } from 'vue';

import '@material/web/textfield/outlined-text-field.js';
import '@material/web/ripple/ripple.js';
import '@material/web/focus/md-focus-ring.js';
import '@material/web/fab/fab.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';

import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import type { ExamCreate } from '@/interfaces/Exam';

import { createExam } from '@/utils/exam_utils';

const emit = defineEmits(['close', 'success']);

const dates = ref();
const examToCreate = ref<ExamCreate>({
    name: '',
    date: '',
    description: '',
    seating: '',
});
const seatingPicker = ref();
const submitButton = ref();
const uploadedSeatName = ref<string>();
const examCreationMessage = ref<string>();
const examCreationSuccess = ref<boolean>(false);

function closeDialog() {
    examToCreate.value = {
        name: '',
        date: '',
        description: '',
        seating: '',
    };

    emit('close');
}

function openFilePicker() {
    seatingPicker.value.click();
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

        examToCreate.value.seating = ef.target.result;
    };

    reader.readAsText(uploadedFile);

    uploadedSeatName.value = uploadedFile.name;
}

async function examFormSubmit() {
    const examDateObject = new Date(dates.value);

    examToCreate.value.date = examDateObject.getTime().toString();

    const { message, success } = await createExam(examToCreate.value);
    console.log(message);

    examCreationMessage.value = message;
    examCreationSuccess.value = success;

    if (success) {
        closeDialog();
        emit('success');
    }
}

function pressExamSubmit() {
    submitButton.value.click();
}

watch(dates, (newValue) => {
    console.log(newValue);
});
</script>

<template>
    <div class="backdrop">
        <form class="dialog" @submit.prevent="examFormSubmit()">
            <div class="top-panel">
                <md-icon-button v-vibrate @click="closeDialog()">
                    <md-icon>close</md-icon>
                </md-icon-button>
            </div>
            <h1 class="header-title">Create Examination</h1>
            <h2 class="subheader">Details</h2>
            <md-outlined-text-field class="dialog-settings-field" v-model="examToCreate.name" label="Examination name" required no-asterisk="true" supporting-text="The name of the examination." maxlength="50"></md-outlined-text-field>
            <p>Examination date</p>
            <VueDatePicker teleport="body" v-model="dates" multi-calendars class="date-picker"></VueDatePicker>
            <md-outlined-text-field class="dialog-settings-field" v-model="examToCreate.description" label="Examination description" required no-asterisk="true" supporting-text="The description of the examination." type="textarea" maxlength="1000"></md-outlined-text-field>
            <h2 class="subheader">Seating</h2>
            <div class="seating-input">
                <p>Your seating</p>
                <label class="file-upload-button" tabindex="0" @click="openFilePicker()" @keyup.enter="openFilePicker()" @keyup.space="openFilePicker()">
                    <md-ripple></md-ripple>
                    <md-focus-ring style="--md-focus-ring-shape: 25px"></md-focus-ring>
                    <md-icon>upload</md-icon>
                </label>
                <input type="file" ref="seatingPicker" name="seating-csv" accept=".csv" style="display: none" multiple @change="handleFileUpload" />
                <p class="file-chosen">{{ uploadedSeatName }}</p>
            </div>
            <p :style="{ color: examCreationSuccess ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-error)' }">{{ examCreationMessage }}</p>
            <button class="hidden-submit" type="submit" ref="submitButton"></button>
            <md-fab class="submit-button" @click="pressExamSubmit()">
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
    color: var(--md-sys-color-primary)
}

.subheader {
    font-size: 1.7em;
    color: var(--md-sys-color-primary)
}

.dialog-settings-field {
    width: 40%;
    color: var(--md-sys-color-on-primary-container);
}

.date-picker {
    width: 40%;
}

.seating-input {
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
