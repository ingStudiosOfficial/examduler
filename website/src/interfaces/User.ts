export interface User {
    _id?: string;
    email: string;
    domain: string;
    name: string;
    exams: string[];
    role: 'student' | 'teacher' | 'admin';
}
