<script setup lang="ts">
import SettingsSection from '../SettingsSection.vue';
import '@material/web/button/outlined-button.js';
import '@material/web/icon/icon.js';
</script>

<template>
    <SettingsSection title="Account">
        <md-outlined-button>
            <md-icon slot="icon">logout</md-icon>
            Logout
        </md-outlined-button>
    </SettingsSection>
</template>

<style scoped>
</style>