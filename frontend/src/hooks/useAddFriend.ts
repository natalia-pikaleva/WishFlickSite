import { useState } from 'react';
import { createNotification } from '../utils/api/notificationsApi';

export function useAddFriend() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentUserId = Number(localStorage.getItem('user_id'));
  const currentUserName = localStorage.getItem('name') || 'Пользователь';

  const addFriend = async (recipientId: number) => {
    if (!currentUserId) {
      setError('Пользователь не авторизован');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createNotification({
        recipient_id: recipientId,
        sender_id: currentUserId,
        type: 'friend_request',
        message: `${currentUserName} хочет добавить вас в друзья.`,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Ошибка при отправке запроса в друзья');
    } finally {
      setLoading(false);
    }
  };

  return { addFriend, loading, error, success };
}
