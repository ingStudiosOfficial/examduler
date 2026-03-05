<script setup lang="ts">
import { ref, watch } from 'vue';

import '@material/web/textfield/outlined-text-field.js';
import '@material/web/ripple/ripple.js';
import '@material/web/focus/md-focus-ring.js';
import '@material/web/fab/fab.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@m3e/web/expansion-panel';

import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import type { ExamCreate } from '@/interfaces/Exam';

import { createExam } from '@/utils/exam_utils';
import { useCheckMobile } from '@/composables/screen_width_composables';
import { showSnackbar } from '@/utils/snackbar';
import { handleFileUpload } from '@/utils/file_utils';

const emit = defineEmits(['close', 'success', 'multiple']);

const { isMobile } = useCheckMobile();

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

async function handleFileUploadWrapper(e: Event) {
    try {
        const uploaded = await handleFileUpload(e);
        examToCreate.value.seating = uploaded.content;
        uploadedSeatName.value = uploaded.filename;
    } catch (error) {
        showSnackbar(`Error while uploading seating: '${error}'`);
    }
}

async function examFormSubmit() {
    const examDateObject = new Date(dates.value);

    examToCreate.value.date = examDateObject.getTime().toString();

    const { message, success } = await createExam(examToCreate.value);
    console.log(message);

    examCreationMessage.value = message;
    examCreationSuccess.value = success;

    if (success) {
        emit('success');
        showSnackbar('Successfully created examination', 4000);
        closeDialog();
    }
}

function pressExamSubmit() {
    submitButton.value.click();
}

function triggerCreateMultiple() {
    emit('multiple');
    closeDialog();
}

watch(dates, (newValue) => {
    console.log(newValue);
});
</script>

<template>
    <div class="backdrop">
        <form class="dialog" @submit.prevent="examFormSubmit()">
            <div class="top-panel">
                <div class="left-buttons">
                    <md-icon-button type="button" v-vibrate @click="triggerCreateMultiple()">
                        <md-icon>file_copy</md-icon>
                    </md-icon-button>
                </div>
                <div class="right-buttons">
                    <md-icon-button type="button" v-vibrate @click="closeDialog()">
                        <md-icon>close</md-icon>
                    </md-icon-button>
                </div>
            </div>
            <h1 class="header-title">Create Examination</h1>
            <h2 class="subheader">Details</h2>
            <md-outlined-text-field class="dialog-settings-field" v-model="examToCreate.name" label="Examination name" required no-asterisk="true" supporting-text="The name of the examination." maxlength="50"></md-outlined-text-field>
            <p>Examination date</p>
            <VueDatePicker v-model="dates" teleport="body" :multi-calendars="!isMobile" class="date-picker"></VueDatePicker>
            <md-outlined-text-field class="dialog-settings-field" v-model="examToCreate.description" label="Examination description" required no-asterisk="true" supporting-text="The description of the examination." type="textarea" maxlength="1000"></md-outlined-text-field>
            <m3e-expansion-panel toggle-position="before" toggle-direction="horizontal" class="advanced-expansion" v-vibrate>
                <span slot="header">Advanced</span>
                <div class="advanced-content">
                    <h2 class="subheader">Seating</h2>
                    <div class="file-input">
                        <p>Your seating</p>
                        <label v-vibrate class="file-upload-button" tabindex="0" @click="openFilePicker()" @keyup.enter="openFilePicker()" @keyup.space="openFilePicker()">
                            <md-ripple></md-ripple>
                            <md-focus-ring style="--md-focus-ring-shape: 25px"></md-focus-ring>
                            <md-icon>upload</md-icon>
                        </label>
                        <input type="file" ref="seatingPicker" name="seating-csv" accept=".csv" style="display: none" @change="handleFileUploadWrapper" />
                        <p class="file-chosen">{{ uploadedSeatName }}</p>
                    </div>
                </div>
            </m3e-expansion-panel>
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
