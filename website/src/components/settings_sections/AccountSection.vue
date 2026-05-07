<script setup lang="ts">
import { logUserOut } from '@/utils/user_utils';
import SettingsSection from '../SettingsSection.vue';
import '@m3e/web/button';
import '@m3e/web/icon';
</script>

<template>
    <SettingsSection title="Account">
        <m3e-button variant="outlined" @click="logUserOut()">
            <m3e-icon name="logout" slot="icon"></m3e-icon>
            Logout
        </m3e-button>
    </SettingsSection>
</template>

<style scoped>
</style>