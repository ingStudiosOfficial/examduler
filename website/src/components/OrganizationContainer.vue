<script setup lang="ts">
import OrganizationCreateContainer from './OrganizationCreateContainer.vue';
</script>

<template>
    <div class="content-wrapper">
        <h1 class="org-header">Your Organization</h1>
        <OrganizationCreateContainer></OrganizationCreateContainer>
    </div>
</template>

<style scoped>
.content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
}

.org-header {
    color: var(--md-sys-color-primary);
}
</style>
