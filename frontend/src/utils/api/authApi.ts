import api from './apiClient';
import { RegisterData } from '../../types';


// Регистрация пользователя
export const registerUser = async (data: RegisterData) => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка регистрации');
  }
};

// Авторизация пользователя
export const loginUser = async (email: string, password: string) => {
  try {
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await api.post('/auth/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = response.data;

    // Сохраняем access и refresh токены в localStorage
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);

    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка входа');
  }
};

// Верификация email
export const verifyEmail = async (email: string, code: string) => {
  try {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Неверный код');
  }
};

// Гостевой вход
export const guestLogin = async () => {
  try {
    const response = await api.post('/auth/guest-register');
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('isGuest', 'true');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка гостевого входа');
  }
};
