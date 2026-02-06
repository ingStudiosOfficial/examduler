<script setup lang="ts">
import type { Domain, DomainVerificationMethod } from '@/interfaces/Domain';
import '@material/web/menu/menu.js';
import '@material/web/icon/icon.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/menu/menu-item.js';
import '@material/web/iconbutton/icon-button.js';
import { onMounted, ref, watch } from 'vue';
import { copyVerificationToken, verifyDomain } from '@/utils/org_utils';

interface ComponentProps {
    domain: Domain;
    index: number;
    orgId: string;
    keyId?: string;
}

interface MdMenuItem extends HTMLElement {
    open: boolean;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits(['domainChange', 'displaySnackBar', 'deleteDomain'])

const domainToDisplay = ref<Domain>();

async function triggerCopyToken(token: string) {
    const snackBarText = await copyVerificationToken(token);

    emit('displaySnackBar', snackBarText);
}

function deleteDomain() {
    emit('deleteDomain', props.index);
}

function toggleMenu() {
    console.log('Toggling menu...');

    const domainVerificationMenu = document.getElementById(`domain-verification-menu-${props.keyId}`);

    if (!domainVerificationMenu) return;

    (domainVerificationMenu as MdMenuItem).open = !(domainVerificationMenu as MdMenuItem).open;
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

watch(domainToDisplay, (newDomainValue) => {
    emit('domainChange', newDomainValue, props.index);
}, { deep: true });

onMounted(() => {
    domainToDisplay.value = props.domain;
    console.log(domainToDisplay.value);
});
</script>

<template>
    <div v-if="domainToDisplay && props.keyId" class="domain-group">
        <md-outlined-text-field class="domain-input" v-model="domainToDisplay.domain" :label="`Domain ${props.index + 1}`" required no-asterisk="true" supporting-text="A domain linked to the organization."></md-outlined-text-field>
        <md-icon-button v-vibrate type="button" @click="triggerCopyToken(domainToDisplay.verificationToken)" :disabled="!domainToDisplay.verificationToken">
            <md-icon>content_copy</md-icon>
        </md-icon-button>
        <md-icon-button v-vibrate type="button" @click="toggleMenu()" :id="`domain-verification-btn-${props.keyId}`" :disabled="!domain.verificationToken || domain.verified">
            <md-icon>domain_verification</md-icon>
        </md-icon-button>
        <md-icon-button v-vibrate type="button" @click="deleteDomain()">
            <md-icon>delete</md-icon>
        </md-icon-button>
        <md-menu :anchor="`domain-verification-btn-${props.keyId}`" :id="`domain-verification-menu-${props.keyId}`" positioning="popover">
            <md-menu-item v-vibrate type="button" @click="triggerVerifyDomain('txt')">
                <div slot="headline">Verify using TXT record</div>
                <md-icon slot="start">dns</md-icon>
            </md-menu-item>
            <md-menu-item v-vibrate type="button" @click="triggerVerifyDomain('http')">
                <div slot="headline">Verify using HTTP</div>
                <md-icon slot="start">http</md-icon>
            </md-menu-item>
        </md-menu>
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