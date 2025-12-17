<script setup lang="ts">
import type { Seating } from '@/interfaces/Seating';
import { getUserSeat } from '@/utils/exam_utils';
import { ref, watch } from 'vue';

interface SeatingProp {
    seating: Seating[][];
    email: string;
}

const props = defineProps<SeatingProp>();

const userSeat = ref<Seating | null>(null);

function tryGetUserSeat() {
    try {
        if (!props.seating || !props.email) {
            console.error('Seating or email data not found.');
            return;
        }

        userSeat.value = getUserSeat(props.seating, props.email);
    } catch (error) {
        console.error('Error while fetching user seat:', error);
    }
}

watch(
    () => props.seating,
    (newSeating: Seating[][]) => {
        if (newSeating && newSeating.length > 0) {
            tryGetUserSeat();
        }
    },
    { immediate: true },
);
</script>

<template>
    <div class="content-wrapper">
        <table class="seating-table">
            <tr v-for="(row, index) in props.seating" :key="'row' + index" class="seating-row">
                <td
                    v-for="seat in row"
                    :key="seat.seat"
                    class="seating-seat"
                    :class="{
                        'is-blank': seat.isBlank,
                        'user-seat': seat.email === userSeat?.email,
                    }"
                >
                    <div class="seating-container">
                        <p class="seat-id">{{ seat.seat }}</p>
                        <p class="seat-name">{{ seat.name }}</p>
                        <p class="seat-email">{{ seat.email }}</p>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</template>

<style scoped>
.content-wrapper {
    box-sizing: border-box;
    overflow-x: scroll;
    padding: 20px;
    border: 2px solid var(--md-sys-color-on-primary-container);
    border-radius: 25px;
}

.seating-seat {
    border: 2px solid var(--md-sys-color-on-primary-container);
    border-radius: 10px;
}

.seating-seat.is-blank {
    visibility: hidden;
}

.seating-seat.user-seat {
    background-color: var(--md-sys-color-secondary-container);
    color: var(--md-sys-color-on-secondary-container);
}

.seating-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.seat-id {
    font-size: 20px;
    margin: 0;
    font-weight: bold;
}

.seat-name {
    font-size: 10px;
    font-weight: bold;
}

.seat-email {
    font-size: 10px;
    font-weight: normal;
}
</style>
