import api from './apiClient';

// Поставить лайк желанию
export const likeWish = async (token: string, wish_id: number): Promise<void> => {
  try {
    await api.post('/likes', { wish_id }, {
	  headers: { Authorization: `Bearer ${token}` }
	});

  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('Гостям запрещено ставить лайки');
      throw new Error('Гостям запрещено ставить лайки');
    } else if (error.response?.status === 400) {
      throw new Error('Лайк уже поставлен');
    }
    throw new Error(error.response?.data?.detail || 'Ошибка при постановке лайка');
  }
};


// Удалить лайк
export const unlikeWish = async (token: string, wish_id: number): Promise<void> => {
  try {
    await api.delete(`/likes/${wish_id}`, {
	  headers: { Authorization: `Bearer ${token}` }
	});
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('Гостям запрещено удалять лайки');
      throw new Error('Гостям запрещено удалять лайки');
    }
    throw new Error(error.response?.data?.detail || 'Ошибка при удалении лайка');
  }
};


// Получить список user_id, кто лайкнул wish
export const getWishLikes = async (wishId: number): Promise<number[]> => {
  try {
    const response = await api.get<number[]>(`/likes/wish/${wishId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при загрузке лайков желаний');
  }
};

// Получить список wish_id, которые лайкнул пользователь
export const getUserLikes = async (userId: number): Promise<number[]> => {
  try {
    const response = await api.get<number[]>(`/likes/user/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при загрузке лайков пользователя');
  }
};

// Получить количество лайков для желания
export const getWishLikesCount = async (wishId: number): Promise<number> => {
  try {
    const response = await api.get<{ count: number }>(`/likes/wish/${wishId}/count`);
    return response.data.count;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при загрузке числа лайков');
  }
};
