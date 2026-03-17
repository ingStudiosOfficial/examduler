<script setup lang="ts">
import type { ExamCreate } from '@/interfaces/Exam';
import { ref, useTemplateRef, watch, nextTick } from 'vue';
import 'active-table';
import type { TableStyle } from 'active-table/dist/types/tableStyle';
import type { ColumnDropdownSettings } from 'active-table/dist/types/columnDropdownSettings';
import { ActiveTable } from 'active-table';

interface ComponentProps {
    exams: ExamCreate[];
}

const props = defineProps<ComponentProps>();

const emit = defineEmits(['edit']);

const examsToEdit = ref<string[][]>(makeActiveTableData(props.exams));
const tableKey = ref<number>(0);
const tableRef = useTemplateRef<ActiveTable>('tableRef');
const isUpdatingFromTable = ref(false);

const tableStyle: TableStyle = {
    borderRadius: '10px',
    border: '2px solid var(--md-sys-color-on-primary-container)',
    backgroundColor: 'var(--md-sys-color-surface)',
    color: 'var(--md-sys-color-on-surface)',
    width: '90%',
};

const headerStyles = {
    default: {
        backgroundColor: 'var(--md-sys-color-surface-container)',
        color: 'var(--md-sys-color-on-surface-container)',
    },
};

const dropdownSettings: ColumnDropdownSettings = {
    isDeleteAvailable: false,
    isInsertLeftAvailable: false,
    isInsertRightAvailable: false,
    isMoveAvailable: false,
};

function makeActiveTableData(exams: ExamCreate[]): string[][] {
    const data = [];

    const header = ['Name', 'Date', 'Description', 'Seating'];
    data.push(header);

    for (const exam of exams) {
        const name = exam.name;
        const date = exam.date;
        const description = exam.description;
        const seating = JSON.stringify(exam.seating) || '';
        data.push([name, date, description, seating]);
    }

    return data;
}

function onDataUpdate(data: string[][]) {
    const examData = data.slice(1);

    const exams: ExamCreate[] = [];
    
    for (const row of examData) {
        const exam: ExamCreate = {
            name: row[0] || '',
            date: row[1] || '',
            description: row[2] || '',
            seating: JSON.parse(row[3] || ''),
        };
        exams.push(exam);
    }

    emit('edit', exams);
}

watch(props, (newValue) => {
    if (isUpdatingFromTable.value) return;
    examsToEdit.value = makeActiveTableData(newValue.exams);
    tableKey.value++;
}, { deep: true });

watch(tableRef, (newRef) => {
    if (!newRef) return;
    newRef.onDataUpdate = (data) => {
        isUpdatingFromTable.value = true;
        onDataUpdate(data as string[][]);
        nextTick(() => { isUpdatingFromTable.value = false; });
    };
});
</script>

<template>
    <active-table ref="tableRef" :data.prop="examsToEdit" :key="tableKey" :tableStyle="tableStyle" :headerStyles="headerStyles" :dragColumns="false" :displayAddNewColumn="false" :columnDropdown="dropdownSettings"></active-table>
</template>

<style scoped>
</style>