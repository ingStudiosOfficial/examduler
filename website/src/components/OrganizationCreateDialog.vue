<script setup lang="ts">
import { ref } from 'vue';

import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import '@material/web/textfield/outlined-text-field.js';

import type { Organization } from '@/interfaces/Org';

const emit = defineEmits(['close']);

const organizationToCreate = ref<Organization>({
    name: '',
    domains: [''],
    members: [],
});

function closeDialog() {
    emit('close');
}
</script>

<template>
    <div class="backdrop">
        <form class="dialog">
            <div class="top-panel">
                <md-icon-button @click="closeDialog()">
                    <md-icon>close</md-icon>
                </md-icon-button>
            </div>
            <h1 class="header-title">Create Organization</h1>
            <h2 class="subheader">General</h2>
            <md-outlined-text-field class="dialog-settings-field" v-model="organizationToCreate.name" label="Organization name" required no-asterisk="true" supporting-text="The name of the organization."> </md-outlined-text-field>
            <h2 class="subheader">Domains</h2>
            <div class="domains">
                <md-outlined-text-field v-for="(domain, index) in organizationToCreate.domains" :key="'domain' + index" class="dialog-settings-field" v-model="organizationToCreate.domains[index]" :label="`Domain ${index}`" required no-asterisk="true" supporting-text="A domain linked to the organization."> </md-outlined-text-field>
            </div>
            <h2 class="subheader">Members</h2>
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
}

.header-title,
.subheader {
    font-size: 35px;
}

.dialog-settings-field {
    width: 40%;
    color: var(--md-sys-color-on-primary-container);
}

.domains {
    width: 100%;
}
</style>
