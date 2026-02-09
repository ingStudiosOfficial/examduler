import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import { vibrate } from './utils/vibrate';
import { vibrateDirective } from './directives/vibrate';

const app = createApp(App);

app.use(router);

app.directive('vibrate', {
    mounted(el, binding) {
        el.addEventListener('click', vibrateDirective(el, binding));
    }
});

app.mount('#app');

window.addEventListener('click', (event) => {
    if (!event.target) return;

    const btn = (event.target as HTMLElement).closest('button');

    if (btn) {
        console.log('Vibrating with element:', btn);
        vibrate([6]);
    }
}, true);