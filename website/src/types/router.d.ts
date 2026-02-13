import 'vue-router';

export type RouteTitle = 'Home' | 'Login' | 'Dashboard' | 'Examination';

declare module 'vue-router' {
    interface RouteMeta {
        title: RouteTitle;
        requiresAuth: boolean;
        access?: 'student' | 'teacher' | 'admin';
    }
}
