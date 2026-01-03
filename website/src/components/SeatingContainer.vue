<script setup lang="ts">
import type { Seating } from '@/interfaces/Seating';

interface SeatingProp {
    seating: Seating[][];
    email: string;
    userSeat: Seating | null;
}

const props = defineProps<SeatingProp>();
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

.seating-table {
    table-layout: fixed;
    width: 100%;
    border-collapse: separate;
    border-spacing: 5px;
}

.seating-seat {
    border: 2px solid var(--md-sys-color-on-primary-container);
    border-radius: 10px;
    aspect-ratio: 1 / 1; 
    min-width: 120px;
    vertical-align: middle;
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
    justify-content: flex-start;
    padding: 10px;
    gap: 10px;
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
