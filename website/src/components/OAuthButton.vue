<script setup lang="ts">
import '@material/web/button/filled-tonal-button.js';

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
    <md-filled-tonal-button :href="props.href" class="login-button"> Continue with {{ props.provider }} </md-filled-tonal-button>
</template>

<style scoped></style>
