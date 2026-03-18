import type { Exam } from '@/interfaces/Exam';
import { fetchCachedExams } from '@/utils/cache_utils';
import { fetchAllExams, sortExams } from '@/utils/exam_utils';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useExamStore = defineStore('exams', () => {
    const exams = ref<Exam[]>([]);
    const loaded = ref<boolean>(false);

    async function refreshExams() {
        try {
            const fetchedExams = await fetchAllExams();
            exams.value = sortExams(fetchedExams);
            loaded.value = true;
        } catch (error) {
            console.error('Error while fetching exams:', error);

            const cachedExams = await fetchCachedExams();
            console.log('Cached exams:', cachedExams);
            exams.value = sortExams(cachedExams);
            loaded.value = true;
        }
    }

    return { exams, loaded, refreshExams };
});
