import type { User } from "@/interfaces/User";
import router from "@/router";
import { fetchCachedUserData } from "@/utils/cache_utils";
import { showSnackbar } from "@/utils/snackbar";
import { fetchUserData } from "@/utils/user_utils";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAccount = defineStore('account', () => {
    const accountData = ref<User | null>(null);

    async function refreshAccountData() {
        try {
            const fetchedUserData = await fetchUserData();
            accountData.value = fetchedUserData;
        } catch (error) {
            console.error('Error while fetching user data:', error);

            const cachedUserData = await fetchCachedUserData();
            if (!cachedUserData) router.replace('/login');
            else accountData.value = cachedUserData;

            showSnackbar('You are currently offline. Viewing read-only cached data.', 4000);
        }
    }

    return { accountData, refreshAccountData };
});