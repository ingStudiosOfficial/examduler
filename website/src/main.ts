import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import './assets/main.css';
import { vibrate } from './utils/vibrate';
import type { DirectiveBinding } from 'vue';
import type { defaultPatterns } from 'web-haptics';

const app = createApp(App);

const pinia = createPinia();

app.use(router);
app.use(pinia);

app.directive('vibrate', {
    mounted(el, binding: DirectiveBinding<keyof typeof defaultPatterns>) {
        el._vibrateHandler = () => {
            vibrate(binding.value);
        };
        el.addEventListener("click", el._vibrateHandler, true);
    },
    unmounted(el) {
        el.removeEventListener("click", el._vibrateHandler, true);
    }
});

app.mount('#app');

document.querySelector('meta[name="theme-color"]')?.setAttribute('content', 'var(--md-sys-color-background)');
document.querySelector('meta[name="background-color"]')?.setAttribute('content', 'var(--md-sys-color-background)');
