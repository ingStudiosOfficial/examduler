<script setup lang="ts">
import { onMounted, ref } from 'vue';
import OrganizationCreateContainer from './OrganizationCreateContainer.vue';
import type { Organization } from '@/interfaces/Org';
import { fetchAllOrganizations } from '@/utils/org_utils';

const organizations = ref<Organization[]>();

onMounted(async () => {
    try {
        organizations.value = await fetchAllOrganizations();
    } catch (error) {
        console.error('Error while fetching all organizations:', error);
    }
});
</script>

<template>
    <div class="content-wrapper">
        <h1 class="org-header">Your Organization</h1>
        <div class="organizations" v-if="organizations?.length !== 0">
            <p v-for="(organization, index) in organizations" :key="'org' + index">{{ organization }}</p>
        </div>
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
