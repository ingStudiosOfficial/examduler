import type { Member } from "@/interfaces/Member";
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

export async function downloadMembersJson(members: Member[]) {
    try {
        const jsonMembers = new Blob([JSON.stringify(members)], { type: 'application/json' });

        const fileName = `examduler_members_export_on_${Date.now().toString()}`;

        if ('showSaveFilePicker' in window) {
            const handle = await window.showSaveFilePicker({
                suggestedName: fileName,
                startIn: 'downloads',
                types: [{
                    description: 'JSON file',
                    accept: { 'application/json': ['.json'] },
                }],
            });

            const writable = await handle.createWritable();
            await writable.write(jsonMembers);
            await writable.close();
        } else {
            const blobUrl = URL.createObjectURL(jsonMembers);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fileName;
            a.style.display = 'none';
            document.body.append(a);
            a.click();

            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
                a.remove();
            }, 1000);
        }
    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            console.error('User cancelled download.');
            return;
        }

        console.error('An unexpected error occurred while downloading members:', error);
        alert('An unexpected error occurred while downloading members.');
    }
}

export async function copyVerificationToken(token: string): Promise<string> {
    if (!('clipboard' in navigator)) {
        console.error('Clipboard API not supported.');
        return 'Clipboard API not supported, failed to copy verification token';
    }

    try {
        await navigator.clipboard.writeText(token);
        return 'Successfully copied verification token';
    } catch (error) {
        console.error('Error while writing to clipboard:', error);
        return 'Failed to copy verification token';
    }
}