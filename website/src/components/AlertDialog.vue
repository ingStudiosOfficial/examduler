<script setup lang="ts">
import '@material/web/dialog/dialog.js';
import '@material/web/button/filled-button/js';

interface ComponentProps {
    title: string;
    message: string;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits(['acknowledged']);

function acknowledge() {
    emit('acknowledged');
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
            <md-filled-button @click="acknowledge()">OK</md-filled-button>
        </div>
    </md-dialog>
</template>

<style scoped>
</style>