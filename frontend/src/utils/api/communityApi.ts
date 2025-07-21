import api from './apiClient';
import { Community, Member } from '../../types';

// Получить список сообществ
export async function getCommunities(): Promise<Community[]> {
  try {
    const response = await api.get<Community[]>('/communities/');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при загрузке сообществ');
  }
}

// Получить сообщество по id
export async function getCommunityById(id: number): Promise<Community> {
  try {
    const response = await api.get<Community>(`/communities/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при загрузке сообщества');
  }
}

// Создать новое сообщество
export async function createCommunity(token: string, formData: FormData): Promise<Community> {
  try {
    const response = await api.post('/communities', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('Для создания сообщества необходима регистрация');
      throw new Error('Гостям запрещено создавать сообщества');
    }
    throw new Error(error.response?.data?.detail || 'Ошибка при создании сообщества');
  }
}

// Обновить сообщество
export async function updateCommunity(token: string, id: number, formData: FormData): Promise<Community> {
  try {
    const response = await api.patch(`/communities/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('Только администратор может изменять данные сообщества');
      throw new Error('Только администратор может изменять данные сообщества');
    }
    throw new Error(error.response?.data?.detail || 'Ошибка при обновлении сообщества');
  }
}

// Удалить сообщество
export async function deleteCommunity(token: string, id: number): Promise<void> {
  if (!token) throw new Error('Пользователь не авторизован');
  try {
    await api.delete(`/communities/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('Только администратор может удалять сообщество');
      throw new Error('Только администратор может удалять сообщество');
    }
    throw new Error(error.response?.data?.detail || 'Ошибка при удалении сообщества');
  }
}


// Получить участников сообщества
export async function fetchCommunityMembers(token: string, communityId: number): Promise<Member[]> {
  try {
    const response = await api.get(`/communities/${communityId}/members`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('Только зарегистрированные пользователи могут просматривать участников');
      throw new Error('Гостям не разрешено просматривать участников сообщества');
    }
    if (error.response?.status === 404) {
      alert('Такого сообщества не существует');
      throw new Error('Сообщество не найдено');
    }
    throw new Error(error.response?.data?.detail || 'Ошибка при получении участников');
  }
}

// Добавить участника в сообщество
export async function addCommunityMember(
  token: string,
  communityId: number,
  userId: number,
  role: string = 'member'
): Promise<Member> {
  try {
    const response = await api.post(
      `/communities/${communityId}/members`,
      { user_id: userId, role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      alert('Этот пользователь уже является участником сообщества');
      throw new Error(error.response?.data?.detail || 'Пользователь уже в сообществе');
    }
    if (error.response?.status === 404) {
      alert('Сообщество не найдено');
      throw new Error('Сообщество не найдено');
    }
    throw new Error(error.response?.data?.detail || 'Ошибка при добавлении участника');
  }
}

// Получить список сообществ пользователя по userId
export const getUserCommunities = async (token: string, userId: number): Promise<UserOut[]> => {
	console.info('start user_id in func', userId)
	const url = `/users/${userId}/communities`;
	console.info('URL:', url);
  try {

	console.info('user_id in func', userId)

    const response = await api.get<UserOut[]>(`/users/${userId}/communities`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при загрузке сообществ пользователя');
  }
};

