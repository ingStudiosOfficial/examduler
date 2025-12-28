<script setup lang="ts">
import type { Organization } from '@/interfaces/Org';

const props = defineProps<Organization>();

const emit = defineEmits(['close', 'removeDomain']);

function closeDialog() {
    emit('close');
}

function deleteDomain(index: number) {
    emit('removeDomain', index);
}
</script>

<template>
    <div class="backdrop">
        <div class="dialog">
            <div class="top-panel">
                <md-icon-button @click="closeDialog()">
                    <md-icon>close</md-icon>
                </md-icon-button>
            </div>
            <h1 class="org-name">{{ props.name }}</h1>
            <h2 class="subheader">Domains</h2>
            <div class="domains">
                <div class="domain-group" v-for="(_, index) in props.domains" :key="'domain' + index">
                    <md-outlined-text-field class="domain-input" :value="props.domains[index]?.domain" :label="`Domain ${index + 1}`" required no-asterisk="true" supporting-text="A domain linked to the organization."></md-outlined-text-field>
                    <md-icon-button type="button" @click="deleteDomain(index)">
                        <md-icon>delete</md-icon>
                    </md-icon-button>
                </div>
            </div>
            <h2 class="subheader">Members</h2>
            {{ props }}
        </div>
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
</style>