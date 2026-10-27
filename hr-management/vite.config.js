import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves this repository under /bai-tap-lon/.
  base: '/bai-tap-lon/',
  build: {
    // Keep all generated files inside the project folder.
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        employees: resolve(__dirname, 'employees.html'),
        employeeDetail: resolve(__dirname, 'employee-detail.html'),
        departments: resolve(__dirname, 'departments.html'),
        users: resolve(__dirname, 'users.html'),
        attendance: resolve(__dirname, 'attendance.html'),
        requests: resolve(__dirname, 'requests.html'),
        payments: resolve(__dirname, 'payments.html'),
        paymentDetail: resolve(__dirname, 'payment-detail.html')
        ,recordDetail: resolve(__dirname, 'record-detail.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
