import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  // GitHub Pages serves this repository under /bai-tap-lon/.
  base: '/bai-tap-lon/',
  build: {
    // GitHub Pages is configured to publish the repository root.
    // Keep the source project in hr-management, but emit the production files
    // one level above it so the repository root contains index.html and assets.
    outDir: '../',
    emptyOutDir: false,
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
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
