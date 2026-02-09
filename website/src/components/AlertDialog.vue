<script setup lang="ts">
import '@material/web/dialog/dialog.js';
import '@material/web/button/filled-button.js';
import { onMounted, ref, nextTick } from 'vue';
import { vibrate } from '@/utils/vibrate';

interface ComponentProps {
    title: string;
    message: string;
    close: () => void;
}

const props = defineProps<ComponentProps>();

const isVisible = ref<boolean>(true);

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

function acknowledge() {
    vibrate([6]);
    isVisible.value = false;
}

function handleClosed() {
    props.close();
}

onMounted(() => {
    setElementZIndex();
});
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