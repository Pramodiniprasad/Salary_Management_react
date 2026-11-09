import axios from 'axios';

const TOKEN_KEY = 'salary_management_token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem('salary_management_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

function payloadData(response) {
  return response.data?.data ?? response.data;
}

export function getErrorMessage(error) {
  const data = error.response?.data;
  const messages = data?.errors;
  if (Array.isArray(messages)) return messages.join(', ');
  if (messages && typeof messages === 'object') {
    return Object.entries(messages)
      .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : value}`)
      .join(' · ');
  }
  return data?.message || error.message || 'Something went wrong. Please try again.';
}

export const authApi = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    const data = payloadData(response);
    const token = data?.token ?? data?.access_token;
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    return { user: data?.user ?? data, token };
  },
  async logout() {
    try {
      await api.delete('/auth/logout');
    } finally {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem('salary_management_user');
    }
  },
  async currentUser() {
    return payloadData(await api.get('/auth/me'));
  },
};

const resource = (path) => ({
  async list(params) {
    return payloadData(await api.get(path, { params }));
  },
  async get(id) {
    return payloadData(await api.get(`${path}/${id}`));
  },
  async create(values) {
    return payloadData(await api.post(path, values));
  },
  async update(id, values) {
    return payloadData(await api.patch(`${path}/${id}`, values));
  },
  async remove(id) {
    return payloadData(await api.delete(`${path}/${id}`));
  },
});

export const employeesApi = resource('/employees');
export const hrApi = resource('/hr_users');
export const salariesApi = resource('/salaries');
export const salarySlipsApi = {
  ...resource('/salary_slips'),
  async download(id) {
    return api.get(`/salary_slips/${id}/download`, { responseType: 'blob' });
  },
};

export function unwrapCollection(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.items)) return data.items;
  return [];
}
