<script setup lang="ts">
import { ref } from 'vue';
import type { Exam } from '@/interfaces/Exam';

import '@material/web/textfield/outlined-text-field.js';

import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const emit = defineEmits(['close']);

const dates = ref();

const examToCreate = ref<Exam>({
    name: '',
    date: '',
    description: '',
    meta: {},
    seating: [],
});

function closeDialog() {
    emit('close');
}
</script>

<template>
    <div class="backdrop">
        <form class="dialog">
            <div class="top-panel">
                <md-icon-button type="button" @click="closeDialog()">
                    <md-icon>close</md-icon>
                </md-icon-button>
            </div>
            <h1 class="header-title">Create Examination</h1>
            <h2 class="subheader">Details</h2>
            <md-outlined-text-field class="dialog-settings-field" v-model="examToCreate.name" label="Examination name" required no-asterisk="true" supporting-text="The name of the examination."> </md-outlined-text-field>
            <p>Examination date</p>
            <VueDatePicker teleport="body" v-model="dates" multi-calendars class="date-picker"></VueDatePicker>
            <md-outlined-text-field class="dialog-settings-field" v-model="examToCreate.description" label="Examination description" required no-asterisk="true" supporting-text="The description of the examination." type="textarea"> </md-outlined-text-field>
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
    gap: 10px;
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

.date-picker {
    width: 50%;
    margin: 10px 0;
}
</style>