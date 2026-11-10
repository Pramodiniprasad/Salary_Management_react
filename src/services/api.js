import axios from 'axios';

const TOKEN_KEY = 'salary_management_access_token';

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiresAt = Number(sessionStorage.getItem('salary_management_token_expires_at'));
  if (token && expiresAt && Date.now() >= expiresAt) {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem('salary_management_token_expires_at');
    sessionStorage.removeItem('salary_management_user');
    window.dispatchEvent(new Event('auth:unauthorized'));
    return Promise.reject(new Error('Your session has expired. Please sign in again.'));
  }
  if (token) config.headers.Authorization = token;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem('salary_management_token_expires_at');
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
  return data?.error || data?.message || error.message || 'Something went wrong. Please try again.';
}

export const authApi = {
  async login(credentials) {
    const response = await api.post('/auth/sign_in', { user: credentials });
    const data = payloadData(response);
    const token = response.headers.authorization;
    if (!token) throw new Error('The sign-in response did not include an Authorization token.');
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem('salary_management_token_expires_at', String(Date.now() + 60 * 60 * 1000));
    return data?.user ?? data;
  },
  async logout() {
    try {
      await api.delete('/auth/sign_out');
    } finally {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem('salary_management_token_expires_at');
      sessionStorage.removeItem('salary_management_user');
    }
  },
  async currentUser() {
    return payloadData(await api.get('/me'));
  },
  async updateProfile(user) {
    return payloadData(await api.patch('/me', { user }));
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
export const usersApi = resource('/users');
export const salariesApi = resource('/salaries');
export const salarySlipsApi = resource('/salary_slips');

export function unwrapCollection(data, key) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.items)) return data.items;
  return [];
}
