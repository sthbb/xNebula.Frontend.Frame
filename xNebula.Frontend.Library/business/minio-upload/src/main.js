import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import App from './App.vue';
import { XCommons } from '@xnebula/frame';
const { initRequest } = XCommons;

async function bootstrap() {
  const app = createApp(App);
  initRequest({
    baseURL: '/api',
    getToken: async () => {
      return [
        'Authorization',
        `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ijg1OTI2MDNiZDk3MDQ5ZiIsInR5cCI6IkpXVCJ9.eyJJZCI6IjNhMTRmNzllLTJiNjEtNmZjNS1kMjQ4LWJmMmY1OGVhZjQyOSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWVpZGVudGlmaWVyIjoiRnJlZHlfZmVpQHhuZWJ1bGEuY29tIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6Iui0ueS6muWbvSIsIk5hbWVFbiI6IiIsIkxhbmd1YWdlIjoiemgtQ04iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJGcmVkeV9mZWlAeG5lYnVsYS5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9tb2JpbGVwaG9uZSI6IiIsIk9yZ0lkIjoiMjJkMTgwMDItMWI3ZS00MzM0LThhNDktZWM2Zjc0YWMxNTJhIiwiT3JnTmFtZSI6IuaXoOmUoeiKr-S6qyIsIk9yZ0Z1bGxOYW1lIjoiIiwiTG9naW5JcCI6IiIsIkNsaWVudElkIjoiM2ExNDVjZmYtMjI2NC01YjAzLTIwZmYtMzEzOThlZjFlNWJjIiwiUm9sZUlkIjoiNTA2MjAyODktZmI4YS00M2E0LTkwN2MtNDRmOWYzZGU1N2EyOzNhMTRmNzlmLWNkYzUtNTA2MS05MTJkLWI2NDU2MzdmYWMyNDszYTE0ZmIyYS1lNzYyLTAwYTItZjE5My0zMTZiMzViZWZiOWUiLCJSb2xlTmFtZSI6IkFkbWluaXN0cmF0b3I75pmu6YCaO1RNUyIsIkFwcEtleXMiOiI4MzJmODI5YmViZDc0Yjg7MGQ5NDllNWM1MGIzNDJjO2JlYzQ5YjU4NmZiMjQ5MjtkMjFmZGUzMjJhOTA0NTA7NjI5ZDcxYmUxYzFlNDhjOzQ1NTQ2NTdmMGVjNDRhYjs4NTkyNjAzYmQ5NzA0OWY7MmZmYjkzYzJjNzRhNDg2O2ZlNGE4OTgyYjM1MzQxZTtlMGZiYTcyYTBmZTA0NWM7MThhZThkZDM3OWI5NDFmOzA5NTQ4ODQ1NWU4NjQxNjtjNDY1NWE5NDNlNmM0Nzk7NjI2NWQyNzdlOWY3NGFiOzMxMjYxYjgxOTVjODQzMTs5MmE0ZTE3MTA4ZjU0MGE7MDBjNmYxODg3OGVmNDQ2O2M1OTBjNjY1ZmY3ZDRiZjsyZjg0MjgxYzRmOGE0YmU7YTJmMTRlNzdjMDY0NGUyIiwiZXhwIjoxNzI4NDk1ODUxLCJpc3MiOiJ3dXhpeGlueGlhbmcuY29tIiwiYXVkIjoid3V4aXhpbnhpYW5nLmNvbSJ9.ZqHY2-5_yXyZDsDWpkT0dzgLfcvGN3nayDZMpoqarZd6BKsucwgwq3jwcoGqU8obvC7oF5o2O_p51kk4UuVMcXW41QWclZwKN3FQ82yissxl8OGxd6wEYoOiJD7t7cIEWdjVKOazwyiJcftCNhwBjoXzOd7X4b6qkNO2N1yxG3tVRki8GT365l2aXz_q0yGxgiklVNiXSJWwI9Bi6tmNte1D_6bkTF7TGQifHAis_hjgSCr1ErHdPRakVWRljhQzDPEdOLsFtgvrLCfrvHpQp9zlzbBUOwykN_GOUwPJtx8AglaDHpUBYzQ7MxlniIy4VFX6SaG726TLdB5FU07t5A`,
      ];
    },
    parseResponse: (response) => {
      return response.data.data;
    },
    errorHandler: async (error) => {
      return Promise.reject(error);
    },
  });
  app.use(ElementPlus);
  app.mount('#app');
}

bootstrap();
