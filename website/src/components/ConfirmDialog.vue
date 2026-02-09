<script setup lang="ts">
import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-tonal-button.js';
import { ref } from 'vue';
import { vibrate } from '@/utils/vibrate';

interface ComponentProps {
    title: string;
    message: string;
    resolve: (value: boolean) => void;
}

const props = defineProps<ComponentProps>();

const isVisible = ref<boolean>(true);

let confirmedResult: boolean = false;

function sendResult(confirmed: boolean) {
    vibrate([6]);
    confirmedResult = confirmed;
    isVisible.value = false;
}

function handleClosed() {
    props.resolve(confirmedResult);
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
            <md-filled-tonal-button @click="sendResult(false)">Cancel</md-filled-tonal-button>
            <md-filled-button @click="sendResult(true)">OK</md-filled-button>
        </div>
    </md-dialog>
</template>

<style scoped>
</style>