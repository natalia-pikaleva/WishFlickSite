import api from './apiClient';

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
      isFriend: data.is_friend,
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

// Интерфейс данных профиля
export interface ProfileData {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  description?: string;
  social_facebook?: string;
  social_twitter?: string;
  social_instagram?: string;
  privacy?: 'public' | 'friends' | 'private';
  is_influencer?: boolean;
}

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

export interface UpdatedProfileData {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  description?: string;
  social_facebook?: string;
  social_twitter?: string;
  social_instagram?: string;
  privacy?: 'public' | 'friends' | 'private';
  is_influencer?: boolean;
}

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

// Интерфейс пользователя из списка
export interface UserListItem {
  id: number;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  mutualFriends: number;
  wishlistsCount: number;
  isFriend: boolean;
}

// Функция получения списка пользователей
export const getUsersList = async (): Promise<UserListItem[]> => {
  try {
    const response = await api.get<UserListItem[]>(`/users/`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при загрузке списка пользователей');
  }
};