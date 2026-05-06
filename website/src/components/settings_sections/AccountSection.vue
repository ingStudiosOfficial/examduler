<script setup lang="ts">
import { logUserOut } from '@/utils/user_utils';
import SettingsSection from '../SettingsSection.vue';
import '@material/web/button/outlined-button.js';
import '@material/web/icon/icon.js';
</script>

<template>
    <SettingsSection title="Account">
        <md-outlined-button @click="logUserOut()">
            <md-icon slot="icon">logout</md-icon>
            Logout
        </md-outlined-button>
    </SettingsSection>
</template>

<style scoped>
</style>