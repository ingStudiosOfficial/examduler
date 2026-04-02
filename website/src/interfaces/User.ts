export interface User {
    _id?: string;
    email: string;
    domain: string;
    name: string;
    exams: string[];
    // TODO: put organizations in the future
    role: 'student' | 'teacher' | 'admin';
}
