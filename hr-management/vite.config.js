import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves this repository under /bai-tap-lon/.
  base: '/bai-tap-lon/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        employees: resolve(__dirname, 'employees.html'),
        departments: resolve(__dirname, 'departments.html'),
        users: resolve(__dirname, 'users.html'),
        attendance: resolve(__dirname, 'attendance.html'),
        requests: resolve(__dirname, 'requests.html'),
        payments: resolve(__dirname, 'payments.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
