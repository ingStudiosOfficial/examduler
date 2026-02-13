<script setup lang="ts">
const props = defineProps({
    message: String,
    displayed: Boolean,
    button: String,
    action: Function,
    params: Array,
});

function executeAction() {
    if (!props.action || !props.params || props.params.length === 0) return;
    props.action(props.params);
}
</script>

<template>
    <Transition name="sb-fade">
        <div v-show="props.displayed" class="sb">
            <p>{{ props.message }}</p>
            <md-outlined-button v-if="props.button" @click="executeAction()">{{ props.button }}</md-outlined-button>
        </div>
    </Transition>
</template>

<style scoped>
.sb {
    position: fixed;
    bottom: 0;
    left: 50dvw;
    transform: translate(-50%, -50%);
    width: 80dvw;
    height: fit-content;
    padding: 20px;
    border-radius: 10px;
    box-sizing: border-box;
    background-color: var(--md-sys-color-inverse-surface);
    color: var(--md-sys-color-inverse-on-surface);
    box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 25px;
    z-index: 2000;
}

.sb p {
    margin: 0;
}

.sb-fade-enter-active, .sb-fade-leave-active {
    transition: opacity 0.3s ease;
}

.sb-fade-enter-from, .sb-fade-leave-to {
    opacity: 0;
}
</style>