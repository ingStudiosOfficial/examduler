<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';

import '@material/web/textfield/outlined-text-field.js';
import '@material/web/ripple/ripple.js';
import '@material/web/focus/md-focus-ring.js';
import '@material/web/fab/fab.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import type { Exam } from '@/interfaces/Exam';
import { handleFileUpload } from '@/utils/file_utils';
import { showSnackbar } from '@/utils/snackbar';
import { bulkCreateExam } from '@/utils/exam_utils';

const emit = defineEmits(['close', 'success', 'single']);

const uploadedExaminations = ref<Exam[]>([]);
const submitButton = ref();
const examCreationMessage = ref<string>();
const examCreationSuccess = ref<boolean>(false);
const uploadedExaminationsName = ref<string>();
const examinationsPicker = useTemplateRef<HTMLInputElement>('examinationsPicker');
const magicPasteInput = ref<string>('');

function closeDialog() {
    emit('close');
}

function pressExamSubmit() {
    submitButton.value.click();
}

function triggerCreateSingle() {
    emit('single');
    closeDialog();
}

function openFilePicker() {
    if (!examinationsPicker.value) return;

    examinationsPicker.value.click();
}

async function fileUploadWrapper(e: Event) {
    console.log('Inside file upload wrapper.');

    try {
        const uploaded = await handleFileUpload(e);
        uploadedExaminations.value = JSON.parse(uploaded.content);
        uploadedExaminationsName.value = uploaded.filename;
        console.log('Uploaded examinations:', uploadedExaminations.value);
    } catch (error) {
        showSnackbar(`Error while uploading examinations: '${error}'`);
    }
}

async function triggerBulkCreateExam() {
    const { message, success } = await bulkCreateExam(uploadedExaminations.value);
    console.log(message);

    examCreationMessage.value = message;
    examCreationSuccess.value = success;

    if (success) {
        emit('success');
        showSnackbar('Successfully created examinations', 4000);
        closeDialog();
    }
}
</script>

<template>
    <div class="backdrop">
        <form class="dialog" @submit.prevent="triggerBulkCreateExam()">
            <div class="top-panel">
                <div class="left-buttons">
                    <md-icon-button type="button" v-vibrate @click="triggerCreateSingle()">
                        <md-icon>draft</md-icon>
                    </md-icon-button>
                </div>
                <div class="right-buttons">
                    <md-icon-button type="button" v-vibrate @click="closeDialog()">
                        <md-icon>close</md-icon>
                    </md-icon-button>
                </div>
            </div>
            <h1 class="header-title">Bulk Create Examinations</h1>
            <h2 class="subheader">Examinations</h2>
            <div class="file-input">
                <p>Your examinations</p>
                <label v-vibrate class="file-upload-button" tabindex="0" @click="openFilePicker()" @keyup.enter="openFilePicker()" @keyup.space="openFilePicker()">
                    <md-ripple></md-ripple>
                    <md-focus-ring style="--md-focus-ring-shape: 25px"></md-focus-ring>
                    <md-icon>upload</md-icon>
                </label>
                <input type="file" ref="examinationsPicker" name="members-csv" accept=".json" style="display: none" @change="fileUploadWrapper" />
                <p class="file-chosen">{{ uploadedExaminationsName }}</p>
            </div>
            <h2 class="subheader">Magic Paste (WIP)</h2>
            <md-outlined-text-field class="dialog-settings-field" v-model="magicPasteInput" label="Magic Paste" no-asterisk="true" supporting-text="Paste the exams in any format and let AI create examinations for you." type="textarea" disabled></md-outlined-text-field>
            <p :style="{ color: examCreationSuccess ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-error)' }">{{ examCreationMessage }}</p>
            <button class="hidden-submit" type="submit" ref="submitButton"></button>
            <md-fab class="submit-button" @click="pressExamSubmit()">
                <md-icon slot="icon">check</md-icon>
            </md-fab>
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
    justify-content: space-between;
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

.date-picker {
    width: 40%;
}

.file-chosen {
    word-wrap: break-word;
}

.hidden-submit {
    display: none;
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
</style>
