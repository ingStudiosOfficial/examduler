interface FileUploadReturn {
    content: string;
    filename: string;
}

export async function handleFileUpload(e: Event): Promise<FileUploadReturn> {
    const target = e.target as HTMLInputElement;

    if (!target.files || target.files.length === 0) {
        throw new Error('No uploaded files found');
    }

    const uploadedFile = target.files[0];

    const fileContent = await uploadedFile?.text();

    if (!fileContent) {
        throw new Error('Failed to get file content');
    }

    return { content: fileContent, filename: uploadedFile?.name || '' };
}
