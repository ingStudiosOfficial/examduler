import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router';

import LoginView from '@/views/LoginView.vue';
import DashboardView from '@/views/DashboardView.vue';

const routes = [
    { path: '/login', name: 'login', component: LoginView, meta: { title: 'Login' } },
    { path: '/dashboard', name: 'dashboard', component: DashboardView, meta: { title: 'Dashboard' } },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
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
