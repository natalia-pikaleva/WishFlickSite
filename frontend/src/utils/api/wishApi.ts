import api from './apiClient';
import { Wish } from '../../types';


// Получить список желаний текущего пользователя
export const getUserWishes = async (): Promise<Wish[]> => {
  try {
    const response = await api.get<Wish[]>(`/wishes/`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при загрузке желаний');
  }
};

// Получить желания пользователя по его id
export const getUserWishesById = async (userId: number): Promise<Wish[]> => {
  try {
    const response = await api.get<Wish[]>(`/users/${userId}/wishes`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при загрузке желаний пользователя');
  }
};

// Получить желание по id
export const getWishById = async (wishId: number): Promise<Wish> => {
  try {
    const response = await api.get<Wish>(`/wishes/${wishId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при загрузке желания');
  }
};

// Создать новое желание
export async function createWish(token: string, formData: FormData): Promise<Wish> {
  try {
    const response = await api.post('/wishes', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('Для создания желания необходимо зарегистрироваться');
      throw new Error('Гостям запрещено создавать желания');
    }
    throw new Error(error.response?.data?.detail || 'Ошибка при создании желания');
  }
}

// Обновить желание
export async function updateWish(token: string, id: number, formData: FormData): Promise<Wish> {
  try {
    const response = await api.patch(`/wishes/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('Для создания желания необходимо зарегистрироваться');
      throw new Error('Гостям запрещено обновлять желания');
    }
    throw new Error(error.response?.data?.detail || 'Ошибка при обновлении желания');
  }
}


// Удалить желание
export async function deleteWish(token: string, id: number): Promise<void> {
  if (!token) throw new Error('Пользователь не авторизован');

  try {
    await api.delete(`/wishes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('Для создания желания необходимо зарегистрироваться');
      throw new Error('Гостям запрещено удалять желания');
    }
    throw new Error(error.response?.data?.detail || 'Ошибка при удалении желания');
  }
}
