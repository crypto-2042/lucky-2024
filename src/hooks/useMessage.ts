import { createApp, h } from 'vue';
import Toast from '@/components/toast.vue';

interface MessageOptions {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  delay?: number;
}

const useMessage = () => {
  const showMessage = ({ message, type = 'success', delay = 2000 }: MessageOptions) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(Toast, {
          message,
          type,
          delay,
          onClose: () => {
            app.unmount();
            document.body.removeChild(container);
          }
        });
      }
    });

    app.mount(container);
  };

  return {
    success: (message: string, delay?: number) => showMessage({ message, type: 'success', delay }),
    error: (message: string, delay?: number) => showMessage({ message, type: 'error', delay }),
    info: (message: string, delay?: number) => showMessage({ message, type: 'info', delay }),
    warning: (message: string, delay?: number) => showMessage({ message, type: 'warning', delay })
  };
};

export default useMessage;