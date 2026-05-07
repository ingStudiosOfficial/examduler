<script setup lang="ts">
import '@m3e/web/button';

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
    <m3e-button variant="filled" v-vibrate :href="props.href" class="login-button">Continue with {{ props.provider }}</m3e-button>
</template>

<style scoped></style>
