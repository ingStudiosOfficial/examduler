<script setup lang="ts">
import type { Seating } from '@/interfaces/Seating';

interface SeatingProp {
    seating?: Seating[][];
}

const props = defineProps<SeatingProp>();
</script>

<template>
    <table class="seating-table">
        <tr v-for="(row, index) in props.seating" :key="'row' + index" class="seating-row">
            <th v-for="seat in row" :key="seat.seat" class="seating-seat">
                <div class="seating-container">
                    <p class="seat-id">{{ seat.seat }}</p>
                    <p class="seat-name">{{ seat.name }}</p>
                    <p class="seat-email">{{ seat.email }}</p>
                </div>
            </th>
        </tr>
    </table>
</template>

<style scoped>
.seating-table, .seating-seat {
    border: 2px solid var(--md-sys-color-on-primary-container);
    border-radius: 10px;
    padding: 10px;
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