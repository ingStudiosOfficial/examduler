export function handleFileUpload(e: Event): string {
    const target = e.target as HTMLInputElement;

    if (!target.files || target.files.length === 0) {
        throw new Error('No uploaded files found')
    }

    const uploadedFile = target.files[0];

    if (!uploadedFile) {
        throw new Error('File missing');
    }

    const reader = new FileReader();

    let result: string | null = null;

    reader.onload = (ef) => {
        if (!ef.target?.result) {
            throw new Error('Failed to read file')
        }

        if (typeof ef.target.result !== 'string') {
            throw new Error('File type is not a string');
        }

        result = ef.target.result;
    };

    if (!result) {
        throw new Error('Failed to read file')
    }

    return result;
}