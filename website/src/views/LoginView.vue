<script setup lang="ts">
import { ref } from 'vue';

import OAuthButton from '@/components/OAuthButton.vue';

const API_BASE_URL = ref<string>(import.meta.env.VITE_API_BASE_URL);
</script>

<template>
    <div class="content-wrapper">
        <h1 class="welcome-text">Welcome!</h1>
        <p class="subtext">Login or signup to Examduler.</p>
        <div class="oauth-providers">
            <OAuthButton provider="Google" :href="API_BASE_URL + '/api/oauth2/google/'" class="oauth-button"></OAuthButton>
        </div>
    </div>
</template>

<style scoped>
.content-wrapper {
    position: fixed;
    top: 50dvh;
    left: 50dvw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 25vw;
    height: fit-content;
    padding: 20px;
    transform: translate(-50%, -50%);
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    border-radius: 25px;
    box-sizing: border-box;
    gap: 20px;
}

.content-wrapper * {
    margin: 0;
}

.oauth-providers {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
}

.oauth-button {
    width: 100%;
}

@media (max-width: 768px) {
    .content-wrapper {
        position: fixed;
        top: unset;
        bottom: 0;
        width: 100%;
        height: 40dvh;
        transform: translate(-50%, 0);
        border-radius: 25px 25px 0 0;
        justify-content: center;
        gap: 40px;
    }

    .welcome-text {
        font-size: 3em;
    }

    .subtext {
        font-size: 1.5em;
    }
}
</style>
