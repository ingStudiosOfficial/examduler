<script setup lang="ts">
import '@material/web/button/filled-button.js';

const props = defineProps({
    provider: {
        type: String,
        required: true,
    },
    href: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <md-filled-button v-vibrate :href="props.href" class="login-button">Continue with {{ props.provider }}</md-filled-button>
</template>

<style scoped></style>
