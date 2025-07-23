import React, { useMemo } from 'react';
import { STATIC_BASE_URL } from '../../config';

const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return '/default-avatar.png';
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `${STATIC_BASE_URL}${avatarUrl}`;
};

const NotificationModal: React.FC<NotificationModalProps> = ({
  open,
  notifications,
  loading,
  onClose,
  onNotificationClick,
  onFriendRequestAccept,
  onFriendRequestReject,
  onJoinRequestAccept,
  onJoinRequestReject
//   onJoinRequestAccept?: (notification: Notification) => void;
//   onJoinRequestReject?: (notification: Notification) => void;
}) => {
  if (!open) return null;

  // Сортируем уведомления: сначала непрочитанные, потом прочитанные
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      if (a.is_read === b.is_read) {
        // Если статус одинаковый, сортируем по дате (сначала новые)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      // Непрочитанные (is_read === false) идут выше
      return a.is_read ? 1 : -1;
    });
  }, [notifications]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Закрыть"
        >
          &times;
        </button>
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">Уведомления</h2>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Загрузка...</div>
          ) : sortedNotifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Нет новых уведомлений</div>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {sortedNotifications.map((n) => (
                <li
                  key={n.id}
                  className={`py-3 px-2 cursor-pointer rounded transition ${
                    !n.is_read ? 'bg-purple-200' : ''
                  } hover:bg-purple-300`}
                  onClick={() => onNotificationClick && onNotificationClick(n)}
                >
                  <div className="flex items-center space-x-3">
                    {/* Аватарка */}
                    {n.avatar_url ? (
                      <img
                        src={getAvatarUrl(n.avatar_url)}
                        alt="Аватар отправителя"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs flex-shrink-0">
                        ?
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="text-sm text-gray-900">{n.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(n.created_at).toLocaleString('ru-RU')}
                      </div>
                    </div>
				  </div>
				  <div className="flex items-center space-x-3 ml-auto">
					  {n.status === 'pending' ? (
					    <>
					      {n.type === 'friend_request' && (
					        <div className="flex space-x-2 ml-4 ml-auto">
					          <button
					          className="ml-2 px-4 py-1 ml-auto rounded-full font-semibold text-white bg-gradient-to-r from-[#6A49C8] to-[#98E2D5] shadow-md hover:from-[#B48DFE] hover:to-[#6A49C8] transition-all duration-200 text-sm"
					          onClick={(e) => {e.stopPropagation(); onFriendRequestAccept && onFriendRequestAccept(n);}}>
					          Принять
					          </button>
					          <button
					          className="ml-2 px-4 py-1 ml-auto rounded-full font-semibold text-white bg-gradient-to-r from-[#DB7093] to-[#FFB6C1] shadow-md hover:from-[#B48DFE] hover:to-[#6A49C8] transition-all duration-200 text-sm"
					          onClick={(e) => {e.stopPropagation(); onFriendRequestReject && onFriendRequestReject(n);}}>
					          Отклонить
					          </button>
					        </div>
					      )}
					      {n.type === 'join_request' && (
					        <div className="flex space-x-2 ml-4 ml-auto">
					          <button
					          className="ml-2 px-4 py-1 ml-auto rounded-full font-semibold text-white bg-gradient-to-r from-[#6A49C8] to-[#98E2D5] shadow-md hover:from-[#B48DFE] hover:to-[#6A49C8] transition-all duration-200 text-sm"
					          onClick={(e) => {e.stopPropagation(); onJoinRequestAccept && onJoinRequestAccept(n);}}>
					          Принять
					          </button>
					          <button
					          className="ml-2 px-4 py-1 ml-auto rounded-full font-semibold text-white bg-gradient-to-r from-[#DB7093] to-[#FFB6C1] shadow-md hover:from-[#B48DFE] hover:to-[#6A49C8] transition-all duration-200 text-sm"
					          onClick={(e) => {e.stopPropagation(); onJoinRequestReject && onJoinRequestReject(n);}}>
					          Отклонить
					          </button>
					        </div>
					      )}
					    </>
					  ) : (
					    <span className="ml-4 ml-auto font-medium text-xs select-none">
					      {n.status === 'accepted' && 'Принято'}
					      {n.status === 'rejected' && 'Отклонено'}
					      {n.status === 'dismissed' && 'Скрыто'}
					    </span>
					  )}
					</div>

                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
