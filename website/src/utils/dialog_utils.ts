import { h, render } from 'vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import AlertDialog from '@/components/AlertDialog.vue';

export const DialogUtils = {
    confirm(message: string, title: string = 'Confirm Action'): Promise<boolean> {
        console.log('Initiating confirm dialog:', message, title)

        const container = document.createElement('div');
        container.classList.add('dialog-bd');
        document.body.appendChild(container);

        return new Promise((resolve) => {
            const vnode = h(ConfirmDialog, {
                title,
                message,
                resolve: (value) => {
                    resolve(value);
                    render(null, container);
                    container.remove();
                }
            });

            render(vnode, container);
        });
    },
    alert(message: string, title: string = 'Alert'): Promise<boolean> {
        console.log('Initiating alert dialog:', message, title);

        const container = document.createElement('div');
        document.body.appendChild(container);

        return new Promise(() => {
            const vnode = h(AlertDialog, {
                title,
                message,
                close: () => {
                    render(null, container);
                    container.remove();
                },
            });

            render(vnode, container);
        });
    }
};