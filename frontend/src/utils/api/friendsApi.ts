import api from './apiClient';
import { UserOut } from '../../types';

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
    if (error.response?.status === 403) {
      alert('Для выполнения этого действия необходимо зарегистрироваться');
    } else {
      throw new Error(error.response?.data?.detail || 'Ошибка при добавлении друга');
    }
  }
};


// Удалить пользователя из друзей по friendId
export const removeFriend = async (friendId: number): Promise<void> => {
  try {
    await api.delete(`/friends/${friendId}`);
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('Для выполнения этого действия необходимо зарегистрироваться');
    } else {
    throw new Error(error.response?.data?.detail || 'Ошибка при удалении друга');
    }
  }
};
