import api from './apiClient';
import { NotificationType, Notification, GetNotificationsParams } from '../../types';



// Универсальная функция для получения уведомлений с опциональным фильтром и лимитом
export const getNotifications = async ({
  readFilter,
  limit,
}: GetNotificationsParams = {}): Promise<Notification[]> => {
  try {
    const params: Record<string, any> = {};
    if (readFilter !== undefined) params.read_filter = readFilter;
    if (limit !== undefined) params.limit = limit;

    const response = await api.get<Notification[]>('/notifications', { params });
    return response.data;
  } catch (error: any) {
    // Безопасная обработка ошибок
    const message =
      error?.response?.data?.detail ||
      error?.message ||
      'Ошибка при загрузке уведомлений';
    throw new Error(message);
  }
};


// Создать новое уведомление
export const createNotification = async (notification: {
  recipient_id: number;
  sender_id?: number;
  community_id?: number;
  type: string;
  message: string;
}): Promise<Notification> => {
  try {
    const response = await api.post<Notification>('/notifications', notification);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при создании уведомления');
  }
};

// Пометить уведомление как прочитанное
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  try {
    await api.put(`/notifications/${notificationId}/read`);
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при обновлении статуса уведомления');
  }
};

// Принять заявку в друзья по уведомлению
export const acceptFriendRequest = async (notificationId: number): Promise<void> => {
  try {
    await api.post(`/notifications/${notificationId}/friend-request/accept`);
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при добавлении друга');
  }
};

// Отклонить заявку в друзья по уведомлению
export const rejectFriendRequest = async (notificationId: number): Promise<void> => {
  try {
    await api.post(`/notifications/${notificationId}/friend-request/reject`);
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при отклонении заявки');
  }
};

// Принять заявку на вступление в сообщество по уведомлению
export const acceptJoinRequest = async (notificationId: number): Promise<void> => {
  try {
    await api.post(`/notifications/${notificationId}/join-request/accept`);
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при добавлении участника');
  }
};

// Отклонить заявку на вступление в сообщество по уведомлению
export const rejectJoinRequest = async (notificationId: number): Promise<void> => {
  try {
    await api.post(`/notifications/${notificationId}/join-request/reject`);
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Ошибка при отклонении заявки');
  }
};
