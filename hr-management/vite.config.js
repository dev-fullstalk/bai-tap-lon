import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        employees: resolve(__dirname, 'employees.html'),
        employeeDetail: resolve(__dirname, 'employee-detail.html'),
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
