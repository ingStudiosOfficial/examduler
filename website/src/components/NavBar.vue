<script setup lang="ts">
import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import { ref } from 'vue';

interface ComponentProps {
    title: string;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits(['expand']);

const expanded = ref<boolean>(false);

function toggleExpand() {
    expanded.value = !expanded.value;
    emit('expand', expanded.value);
}
</script>

<template>
    <aside class="sidebar">
        <div class="icon-wrapper">
            <md-icon-button @click="toggleExpand()">
                <md-icon>menu</md-icon>
            </md-icon-button>
        </div>

        <div class="sub-sidebar">
            
        </div>
    </aside>
</template>

<style scoped>
.sidebar {
    position: sticky;
    top: 0;
    left: 0;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: flex-start; 
    padding: 20px 0;
    box-sizing: border-box;
    background-color: var(--md-sys-color-surface-container);
    transition: width 0.3s ease;
}

.icon-wrapper {
    width: 6dvw; 
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
}

.sub-sidebar {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}
</style>