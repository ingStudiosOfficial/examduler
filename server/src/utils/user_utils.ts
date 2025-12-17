export function getDomain(email: string): string {
    if (!email) {
        console.error('No email found.');
        throw new Error('No email found.');
    }

    const regex = /@(.*)/;
    const match = email.match(regex);

    if (match && match[1]) {
        return match[1];
    } else {
        throw new Error('No domain found.');
    }
}

export function constructName(firstName?: string, middleName?: string, lastName?: string): string {
    const nameParts = [firstName, middleName, lastName];

    const name = nameParts.filter((part) => !!part).join(' ');

    if (name === '') {
        throw new Error('Name is empty.');
    }

    return name;
}
