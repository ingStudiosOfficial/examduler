<script setup lang="ts">
import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button/js';
import '@material/web/button/filled-tonal-button.js';

interface ComponentProps {
    title: string;
    message: string;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits(['confirmed']);

function sendResult(confirmed: boolean) {
    emit('confirmed', confirmed);
}
</script>

<template>
    <md-dialog>
        <div slot="headline">
            {{ props.title }}
        </div>
        <div slot="content">
            {{ props.message }}
        </div>
        <div slot="actions">
            <md-filled-button @click="sendResult(true)">OK</md-filled-button>
            <md-filled-tonal-button @click="sendResult(false)">Cancel</md-filled-tonal-button>
        </div>
    </md-dialog>
</template>

<style scoped>
</style>