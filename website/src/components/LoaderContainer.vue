<script setup lang="ts">
import '@material/web/progress/circular-progress';

const props = defineProps({
    loadingText: String,
    loaderColor: String,
});
</script>

<template>
    <div class="loader-wrapper">
        <md-circular-progress class="loader" indeterminate></md-circular-progress>
        <p
            class="loader-text"
            :style="{
                color: props.loaderColor,
            }"
        >
            {{ props.loadingText }}
        </p>
    </div>
</template>

<style scoped>
.loader-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.loader {
    --md-circular-progress-size: 60px;
}

.loader-text {
    font-size: 1.5rem;
    text-align: center;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
