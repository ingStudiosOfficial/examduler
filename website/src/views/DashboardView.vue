<script setup lang="ts">
import { onMounted, ref } from 'vue';

import ExaminationsContainer from '@/components/ExaminationsContainer.vue';
import OrganizationContainer from '@/components/OrganizationContainer.vue';
import LoaderContainer from '@/components/LoaderContainer.vue';

import type { User } from '@/interfaces/User';

import { fetchUserData } from '@/utils/user_utils';

const userData = ref<User | null>(null);

onMounted(async () => {
    try {
        userData.value = await fetchUserData();
    } catch (error) {
        console.error('Error while fetching user:', error);
    }
});
</script>

<template>
    <div v-if="userData" class="content-wrapper">
        <ExaminationsContainer :user="userData"></ExaminationsContainer>
        <OrganizationContainer v-if="userData.role === 'admin'"></OrganizationContainer>
    </div>
    <LoaderContainer v-else class="loader-container" loading-text="Please wait while we load the neccessary data." loader-color="var(--md-sys-color-primary)"></LoaderContainer>
</template>

<style scoped>
.content-wrapper {
    width: 100%;
    box-sizing: border-box;
    overflow: visible;
}

.loader-container {
    position: fixed;
    top: 50vh;
    left: 50vw;
    transform: translate(-50%, -50%);
}
</style>
