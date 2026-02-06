import { createRouter, createWebHistory, type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router';

import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';
import ExamView from '@/views/ExamView.vue';
import type { ResponseJson } from '@/interfaces/ResponseJson';

const routes = [
    { path: '/', name: 'home', component: LoginView, meta: { title: 'Home', requiresAuth: false } },
    { path: '/login', name: 'login', component: LoginView, meta: { title: 'Login', requiresAuth: false } },
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { title: 'Dashboard', requiresAuth: true } },
    { path: '/exam', name: 'exam', component: ExamView, meta: { title: 'Exam', requiresAuth: false } },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
});

const apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL;

router.beforeEach(async (to: RouteLocationNormalized, _, next: NavigationGuardNext) => {
    if (to.path === '/') {
        console.log('Fetching response...');

        const response = await fetch(`${apiBaseUrl}/api/session/verify/`, {
            method: 'GET',
            credentials: 'include',
        });

        console.log('Fetched response.');

        const responseJson: ResponseJson = await response.json();

        console.log('Response:', responseJson);

        if (response.ok) {
            console.log('User authenticated successfully.');
            next('/dashboard');
        } else {
            console.error('Failed to authenticate user:', response.status);
            next('/login');
        }
    }

    const requiresAuth = to.meta.requiresAuth;

    if (requiresAuth) {
        console.log(`Route (${to.fullPath}) requires auth, checking...`);

        try {
            console.log('Fetching response...');

            const response = await fetch(`${apiBaseUrl}/api/session/verify/`, {
                method: 'GET',
                credentials: 'include',
            });

            console.log('Fetched response.');

            const responseJson: ResponseJson = await response.json();

            console.log('Response:', responseJson);

            if (response.ok) {
                console.log('User authenticated successfully.');
                next();
            } else {
                console.error('Failed to authenticate user:', response.status);
                next('/login');
            }
        } catch (error) {
            console.error('Failed to authenticate user:', error);
            next('/login');
        }
    } else {
        next();
    }
});

router.afterEach((to: RouteLocationNormalized) => {
    const pageTitle = to.meta.title;

    if (pageTitle) {
        document.title = `${to.meta.title as string} | Examduler`;
    } else {
        document.title = 'Examduler';
    }
});

export default router;
