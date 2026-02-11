<script setup lang="ts">
import type { Exam } from '@/interfaces/Exam';
import { summarizeExams } from '@/utils/ai_utils';
import { onMounted, ref } from 'vue';
import '@material/web/progress/circular-progress.js';
import type { User } from '@/interfaces/User';

interface ComponentProps {
    exams: Exam[];
    user: User;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits(['error']);

const summary = ref<string>('');
const message = ref<string>('');
const modelDownloadProgress = ref<number | null>(null);

function onChunk(generatedSummary: string) {
    summary.value = generatedSummary;
}

function onDownload(progress: number) {
    modelDownloadProgress.value = progress;
}

function onEvent(receivedMessage: string) {
    message.value = receivedMessage;
}

onMounted(async () => {
    try {
        await summarizeExams(props.exams, props.user, onChunk, onDownload, onEvent);
    } catch (error) {
        emit('error', error);
    }
});
</script>

<template>
    <div class="summary-container">
        <h1 class="summary-header">AI Summary</h1>
        <md-circular-progress v-if="modelDownloadProgress !== null && modelDownloadProgress !== 1" :value="modelDownloadProgress" four-color></md-circular-progress>
        <div class="loading">
            <md-circular-progress four-color indeterminate></md-circular-progress>
            <p>{{ message }}</p>
        </div>
        <p v-if="summary">{{ summary }}</p>
    </div>
</template>

<style scoped>
.summary-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 20px;
}

.summary-header {
    color: var(--md-sys-color-primary);
}

.loading {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>