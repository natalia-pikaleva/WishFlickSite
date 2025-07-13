import api from './apiClient';
import { ProfileData, UpdatedProfileData, UserListItem } from '../../types';

// Получить данные профиля пользователя по его id
export async function fetchUserProfile(userId: string) {
  try {
    const res = await api.get(`/users/${userId}`);
    const data = res.data;
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatarUrl: data.avatar_url,
      description: data.description,
      socialLinks: {
        facebook: data.social_facebook,
        twitter: data.social_twitter,
        instagram: data.social_instagram,
      },
      isFriend: data.isFriend,
    };
  } catch (e) {
    alert('Ошибка при загрузке профиля');
    return null;
  }
}

// Получить данные профиля текущего пользователя
export const getUserProfile = async () => {
  try {
    const response = await api.get(`/users/me`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка получения профиля');
  }
};



// Изменение данных профиля
export const updateUserProfile = async (formData: FormData) => {
  try {
    const response = await api.put(`/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка обновления профиля');
  }
};



// Загрузка аватара пользователя
export const uploadUserAvatar = async (formData: FormData): Promise<UpdatedProfileData> => {
  try {
    const response = await api.put(`/profile/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка загрузки аватара');
  }
};



// Функция получения списка пользователей
export const getUsersList = async (): Promise<UserListItem[]> => {
  try {
    const response = await api.get<UserListItem[]>(`/users/`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при загрузке списка пользователей');
  }
};