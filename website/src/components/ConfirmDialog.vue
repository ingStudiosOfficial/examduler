<script setup lang="ts">
import '@material/web/dialog/dialog.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-tonal-button.js';
import { nextTick, onMounted, ref } from 'vue';
import { vibrate } from '@/utils/vibrate';

interface ComponentProps {
    title: string;
    message: string;
    resolve: (value: boolean) => void;
}

const props = defineProps<ComponentProps>();

const isVisible = ref<boolean>(true);

let confirmedResult: boolean = false;

async function setElementZIndex() {
    const dialog = document.getElementById('confirm-dialog');
    if (!dialog) {
        console.error('Dialog missing.');
        return;
    }

    const dialogShadowRoot = dialog.shadowRoot;
    if (!dialogShadowRoot) {
        console.error('Shadow root missing.');
        return;
    }

    await nextTick();

    const scrim: HTMLElement | null = dialogShadowRoot.querySelector('.scrim');
    if (!scrim) {
        console.error('Scrim missing.');
        return;
    }

    scrim.style.zIndex = '2000';
}

function sendResult(confirmed: boolean) {
    vibrate([6]);
    confirmedResult = confirmed;
    isVisible.value = false;
}

function handleClosed() {
    props.resolve(confirmedResult);
}

onMounted(() => {
    setElementZIndex();
});
</script>

<template>
    <md-dialog :open="isVisible" @closed="handleClosed()" id="confirm-dialog">
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