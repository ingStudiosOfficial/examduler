import 'vue-router';

declare module 'vue-router' {
    interface RouteMeta {
        title: string;
        requiresAuth: boolean;
        access?: 'student' | 'teacher' | 'admin';
    }
}
