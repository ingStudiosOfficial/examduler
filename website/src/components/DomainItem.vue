<script setup lang="ts">
import type { Domain, DomainVerificationMethod } from '@/interfaces/Domain';
import '@m3e/web/menu';
import '@m3e/web/icon';
import '@material/web/textfield/outlined-text-field.js';
import '@m3e/web/icon-button';
import { onMounted, ref, watch } from 'vue';
import { copyVerificationToken, verifyDomain } from '@/utils/org_utils';

interface ComponentProps {
    domain: Domain;
    index: number;
    orgId: string;
    keyId?: string;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits(['domainChange', 'displaySnackBar', 'deleteDomain']);

const domainToDisplay = ref<Domain>();

async function triggerCopyToken(token: string) {
    const snackBarText = await copyVerificationToken(token);

    emit('displaySnackBar', snackBarText);
}

function deleteDomain() {
    emit('deleteDomain', props.index);
}

async function triggerVerifyDomain(method: DomainVerificationMethod) {
    if (!domainToDisplay.value?.domain) {
        console.error('Domain missing.');
        return;
    }

    console.log('Domain to verify:', domainToDisplay.value.domain);

    const { message, success } = await verifyDomain(domainToDisplay.value.domain, props.orgId, method);

    if (!success) {
        console.error('Failed to verify domain:', message);
        emit('displaySnackBar', 'Failed to verify domain: ' + message);
        return;
    }

    console.log('Successfully verify domain:', message);

    emit('displaySnackBar', 'Successfully verified domain');
}

watch(
    domainToDisplay,
    (newDomainValue) => {
        emit('domainChange', newDomainValue, props.index);
    },
    { deep: true },
);

onMounted(() => {
    domainToDisplay.value = props.domain;
    console.log(domainToDisplay.value);
});
</script>

<template>
    <div v-if="domainToDisplay && props.keyId" class="domain-group">
        <md-outlined-text-field class="domain-input" v-model="domainToDisplay.domain" :label="`Domain ${props.index + 1}`" required no-asterisk="true" supporting-text="A domain linked to the organization."></md-outlined-text-field>
        <m3e-icon-button v-vibrate type="button" @click="triggerCopyToken(domainToDisplay.verificationToken)" :disabled="!domainToDisplay.verificationToken">
            <m3e-icon name="content_copy"></m3e-icon>
        </m3e-icon-button>
        <m3e-icon-button v-vibrate type="button" :disabled="!domain.verificationToken || domain.verified">
            <m3e-icon name="domain_verification"></m3e-icon>
            <m3e-menu-trigger :for="`domain-verification-menu-${props.keyId}`"></m3e-menu-trigger>
        </m3e-icon-button>
        <m3e-icon-button v-vibrate type="button" @click="deleteDomain()">
            <m3e-icon name="delete"></m3e-icon>
        </m3e-icon-button>
        <m3e-menu :id="`domain-verification-menu-${props.keyId}`">
            <m3e-menu-item v-vibrate type="button" @click="triggerVerifyDomain('txt')">
                Verify using TXT record
                <m3e-icon name="dns" slot="icon"></m3e-icon>
            </m3e-menu-item>
            <m3e-menu-item v-vibrate type="button" @click="triggerVerifyDomain('http')">
                Verify using HTTP
                <m3e-icon name="http" slot="icon"></m3e-icon>
            </m3e-menu-item>
        </m3e-menu>
    </div>
</template>

<style scoped>
.domain-group {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 40%;
}

.domain-input {
    width: 60%;
}

@media (max-width: 768px) {
    .domain-group {
        width: 80%;
    }
}
</style>
