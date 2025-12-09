import type { User } from "@/interfaces/User";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export async function fetchUserData(): Promise<User> {
    try {
        const response = await fetch(`${apiBaseUrl}/api/user/fetch/`, {
            method: 'GET',
            credentials: 'include',
        });

        const responseJson = await response.json();

        console.log('Response:', responseJson);

        if (response.ok) {
            if (!responseJson.user) {
                console.error('User not found.');
                throw new Error('User not found.');
            }

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