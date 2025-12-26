import type { Organization, OrganizationCreate } from "@/interfaces/Org";
import type { ResourceCreate } from "@/interfaces/ResourceCreate";
import type { ResponseJson } from "@/interfaces/ResponseJson";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export async function createOrganization(orgDetails: OrganizationCreate): Promise<ResourceCreate> {
    console.log('Creating organization:', orgDetails);

    try {
        const body = JSON.stringify(orgDetails);
        console.log('Sending organization:', body);

        const response = await fetch(`${apiBaseUrl}/api/organization/create/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
            credentials: 'include',
        });

        const responseJson: ResponseJson = await response.json();

        if (!response.ok) {
            console.error('Error while creating organization:', responseJson);
            return { message: responseJson.message, success: false };
        }

        console.log('Successfully created organization:', responseJson);

        return { message: responseJson.message, success: true };
    } catch (error) {
        console.error('Error while creating organization:', error);
        return { message: 'An unexpected error occurred while creating the organization,', success: false };
    }
}

export async function fetchAllOrganizations(): Promise<Organization[]> {
    try {
        const response = await fetch(`${apiBaseUrl}/api/organizations/fetch/user/`, {
            method: 'GET',
            credentials: 'include',
        });

        const responseJson: ResponseJson = await response.json();

        if (!responseJson?.organizations) {
            console.error('User has no organizations.');
            return [];
        }

        if (!response.ok) {
            console.error('Failed to fetch organizations:', responseJson);
            throw new Error(`Failed to fetch organizations: ${responseJson.message}`);
        }

        const organizations: Organization[] = responseJson.organizations as Organization[];

        console.log('Fetched organizations:', organizations);

        return organizations;
    } catch (error) {
        console.error('Failed to fetch organizations:', error);
        throw new Error('An unexpected error occurred while fetching organizations.');
    }
}