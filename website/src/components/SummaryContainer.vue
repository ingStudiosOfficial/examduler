<script setup lang="ts">
import { Exam } from '@/interfaces/Exam';
import { summarizeExams } from '@/utils/ai_utils';
import { onMounted, ref } from 'vue';

const props = defineProps<Exam[]>();

const summary = ref<string>('');

function onChunk(generatedSummary: string) {
    summary.value = generatedSummary;
}

onMounted(() => {
    summarizeExams(props, onChunk, )
});
</script>

<template>
    <div class="summary-container">
        <h1 class="summary-header">AI Summary</h1>
        <p>text</p>
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
</style>