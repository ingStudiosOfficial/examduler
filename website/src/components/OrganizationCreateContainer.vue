<script setup lang="ts">
import '@material/web/button/filled-button.js';
</script>

<template>
    <p class="no-org-text">You don't look like you have any organizations yet.</p>
    <md-filled-button class="org-create-btn">Create an organization</md-filled-button>
</template>

<style scoped>
.content-wrapper {
    padding: 0;
    margin: 0;
}

.org-create-btn {
    margin: 10px 0;
}
</style>