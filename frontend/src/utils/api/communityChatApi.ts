import api from './apiClient';
import { CommunityChatMessage } from '../../types';

// Получить сообщения чата для сообщества
export async function getCommunityChatMessages(communityId: number): Promise<CommunityChatMessage[]> {
  try {
    const response = await api.get<CommunityChatMessage[]>(`/community-chat/${communityId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при загрузке сообщений чата');
  }
}

// Отправить сообщение в чат сообщества
export async function sendCommunityChatMessage(token: string, chatMessage: { community_id: number, message: string }): Promise<CommunityChatMessage> {
  try {
    const response = await api.post('/community-chat/', chatMessage, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('Для отправки сообщений необходима регистрация');
      throw new Error('Гостям запрещено отправлять сообщения');
    }
    throw new Error(error.response?.data?.detail || 'Ошибка при отправке сообщения');
  }
}

// Удалить сообщение из группового чата
export async function deleteCommunityChatMessage(token: string, messageId: number): Promise<void> {
  if (!token) throw new Error('Пользователь не авторизован');
  try {
    await api.delete(`/community-chat/${messageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('Недостаточно прав для удаления сообщения');
      throw new Error('Гостям запрещено удалять сообщения');
    }
    throw new Error(error.response?.data?.detail || 'Ошибка при удалении сообщения');
  }
}
