import type { ResponseJson } from '@/interfaces/ResponseJson';
import type { User } from '@/interfaces/User';
import { cacheUserData } from './cache_utils';
import { M3eSnackbar } from '@m3e/web/snackbar';
import router from '@/router';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export async function fetchUserData(): Promise<User> {
    try {
        const response = await fetch(`${apiBaseUrl}/api/user/fetch/`, {
            method: 'GET',
            credentials: 'include',
        });

        const responseJson: ResponseJson = await response.json();

        console.log('Response:', responseJson);

        if (response.ok) {
            if (!responseJson.user) {
                console.error('User not found.');
                throw new Error('User not found.');
            }

            cacheUserData(responseJson.user as User);

            return responseJson.user as User;
        } else {
            console.error('Error while fetching user:', response.status);
            throw new Error('Error while fetching user.');
        }
    } catch (error) {
        console.error('Error while fetching user:', error);
        throw error;
    }
}

export async function logUserOut() {
    try {
        const response = await fetch(`${apiBaseUrl}/api/session/logout/`, {
            method: 'POST',
            credentials: 'include',
        });

        const responseJson: ResponseJson = await response.json();

        if (!response.ok) {
            M3eSnackbar.open(responseJson.message, {
                duration: 4000,
            });

            return;
        }

        router.replace({ name: 'login', query: { logout: 'true' }});
    } catch (error) {
        M3eSnackbar.open((error as Error).message, {
            duration: 4000,
        });
    }
}