import api from './apiClient';

// Тип описания желания (пример)
export interface Wish {
  id: number;
  title: string;
  description?: string | null;
  image_url?: string | null;
  goal: number;
  raised: number;
  owner_id: number;
  is_public: boolean;
}

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

  const response = await api.post(`/wishes`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
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

  const response = await api.put(`/wishes/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

// Удалить желание
export async function deleteWish(id: number): Promise<void> {
  await api.delete(`/wishes/${id}`);
}
