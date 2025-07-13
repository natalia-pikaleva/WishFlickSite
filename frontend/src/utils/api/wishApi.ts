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
export async function createWish(data: {
  title: string;
  description: string;
  image: string;
  goal: number;
  is_public: boolean;
}): Promise<Wish> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('goal', data.goal.toString());
  formData.append('is_public', data.is_public ? 'true' : 'false');
  if (data.image) {
    formData.append('image_url', data.image);
  }

  try {
    const response = await api.post(`/wishes`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      // Специфическая обработка ошибки гостевого доступа
      alert('Для создания желания необходимо зарегистрироваться');
      throw new Error('Гостям запрещено создавать желания');
    }
    // Для остальных ошибок пробрасываем дальше
    throw new Error(error.response?.data?.detail || 'Ошибка при создании желания');
  }
}


// Обновить желание
export async function updateWish(
  id: number,
  data: {
    title: string;
    description: string;
    image: string;
    goal: number;
    is_public: boolean;
  }
): Promise<Wish> {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('goal', data.goal.toString());
  formData.append('is_public', data.is_public ? 'true' : 'false');
  if (data.image) {
    formData.append('image_url', data.image);
  }

  try {
    const response = await api.put(`/wishes/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
	if (error.response?.status === 403) {
	// Специфическая обработка ошибки гостевого доступа
    alert('Для создания желания необходимо зарегистрироваться');
    throw new Error('Гостям запрещено обновлять желания');
    }
    // Для остальных ошибок пробрасываем дальше
    throw new Error(error.response?.data?.detail || 'Ошибка при обновлении желания');
  }
}

// Удалить желание
export async function deleteWish(id: number): Promise<void> {
  try {
    await api.delete(`/wishes/${id}`);
  } catch (error: any) {
	if (error.response?.status === 403) {
	// Специфическая обработка ошибки гостевого доступа
    alert('Для создания желания необходимо зарегистрироваться');
    throw new Error('Гостям запрещено удалять желания');
    }
    // Для остальных ошибок пробрасываем дальше
    throw new Error(error.response?.data?.detail || 'Ошибка при удалении желания');
  }
}
