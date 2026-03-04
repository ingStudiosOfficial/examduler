<script setup lang="ts">
import { ref } from 'vue';

import '@material/web/textfield/outlined-text-field.js';
import '@material/web/ripple/ripple.js';
import '@material/web/focus/md-focus-ring.js';
import '@material/web/fab/fab.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';

import type { ExamCreate } from '@/interfaces/Exam';

const emit = defineEmits(['close', 'success']);

const examToCreate = ref<ExamCreate>({
    name: '',
    date: '',
    description: '',
    seating: '',
});
const submitButton = ref();
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

function pressExamSubmit() {
    submitButton.value.click();
}
</script>

<template>
    <div class="backdrop">
        <form class="dialog">
            <div class="top-panel">
                <div class="left-buttons">
                    <md-icon-button type="button" v-vibrate>
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
