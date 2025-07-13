import api from './apiClient';

export interface UserOut {
  id: number;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
}

// Получить список друзей текущего пользователя
export const getCurrentUserFriends = async (): Promise<UserOut[]> => {
  try {
    const response = await api.get<UserOut[]>(`/friends`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при загрузке друзей текущего пользователя');
  }
};

// Получить список друзей пользователя по userId
export const getUserFriendsById = async (userId: number): Promise<UserOut[]> => {
  try {
    const response = await api.get<UserOut[]>(`/users/${userId}/friends`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при загрузке друзей пользователя');
  }
};

// Добавить пользователя в друзья по friend_id
export const addFriend = async (friendId: number): Promise<void> => {
  try {
    await api.post(`/friends/${friendId}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при добавлении друга');
  }
};
