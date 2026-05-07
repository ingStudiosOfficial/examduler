<script setup lang="ts">
import '@material/web/ripple/ripple.js';
import '@material/web/focus/md-focus-ring.js';

import type { Organization } from '@/interfaces/Org';

const props = defineProps<Organization>();
</script>

<template>
    <button class="card" v-vibrate>
        <md-ripple></md-ripple>
        <md-focus-ring style="--md-focus-ring-shape: 25px"></md-focus-ring>
        <h1>{{ props.name }}</h1>
        <div class="organization-domains">
            <p v-for="(domain, index) in domains" class="organization-domain" :key="`domain${index}`">{{ domain.domain }}</p>
        </div>
    </button>
</template>

<style scoped>
.card {
    all: unset;
    cursor: pointer;
    position: relative;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 25px;
    background-color: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    text-align: center;
    width: 100%;
    box-sizing: border-box;
}

.organization-domains {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.organization-domain {
    font-weight: bold;
}
</style>
