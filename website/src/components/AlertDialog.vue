<script setup lang="ts">
import '@material/web/dialog/dialog.js';
import '@material/web/button/filled-button.js';
import { ref } from 'vue';

interface ComponentProps {
    title: string;
    message: string;
    close: () => void;
}

const props = defineProps<ComponentProps>();

const isVisible = ref<boolean>(true);

function acknowledge() {
    isVisible.value = false;
}

function handleClosed() {
    props.close();
}
</script>

<template>
    <md-dialog :open="isVisible" @closed="handleClosed()">
        <div slot="headline">
            {{ props.title }}
        </div>
        <div slot="content">
            {{ props.message }}
        </div>
        <div slot="actions">
            <md-filled-button @click="acknowledge()">OK</md-filled-button>
        </div>
    </md-dialog>
</template>

<style scoped>
</style>