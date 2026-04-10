<script setup lang="ts">
</script>

<template>
    <div class="settings-wrapper">
        <h1 class="settings-header">Settings</h1>
        <h2 id="account" class="settings-header">Account</h2>
    </div>
</template>

<style scoped>
.settings-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
    box-sizing: border-box;
    overflow: visible;
    position: relative;
    min-height: 100%;
    padding: 20px;
}

.settings-header {
    color: var(--md-sys-color-primary);
}
</style>