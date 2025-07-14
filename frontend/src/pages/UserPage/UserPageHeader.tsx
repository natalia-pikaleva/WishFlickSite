import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, MessageCircle, Settings, MapPin, Calendar, Link } from 'lucide-react';
import {
	fetchUserProfile,
	 } from '../../utils/api/userApi'
import { createNotification } from '../../utils/api/notificationsApi';
import { removeFriend } from '../../utils/api/friendsApi'
import { UserProfileData, UserOut, Wish } from '../types';

import { STATIC_BASE_URL } from '../../config';

interface UserPageHeaderProps {
  userId: number;
  friends: UserOut[];
  wishes: Wish[];
}


const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return '/default-avatar.png';
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `${STATIC_BASE_URL}${avatarUrl}`;
};

function pluralize(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

const UserPageHeader: React.FC<UserPageHeaderProps> = ({ userId, wishes, friends }) => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const currentUserId = Number(localStorage.getItem('user_id'));
  const currentUserName = localStorage.getItem('name') || 'Пользователь';

  const [isFriend, setIsFriend] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
	  setIsGuest(localStorage.getItem('isGuest') === 'true');
	}, []);

  useEffect(() => {
    fetchUserProfile(userId.toString())
      .then(data => {
        if (data) {

		  console.log('isFriend from API:', data.isFriend);
          setProfile(data);
          setIsFriend(data.isFriend);
        }
      })
      .catch(() => {
        setError('Ошибка при загрузке профиля');
      });
  }, [userId]);

  const handleAddFriend = async () => {
    if (!currentUserId) {
      alert('Пользователь не авторизован');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createNotification({
        recipient_id: userId,
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

  const handleRemoveFriend = async () => {
	  if (!window.confirm('Вы уверены, что хотите удалить из друзей?')) return;
	  setLoading(true);
	  setError(null);
	  setSuccess(false);
	  try {
	    await removeFriend(userId);
	    setIsFriend(false);
	    setSuccess(true);
	  } catch (e: any) {
	    setError(e.message || 'Ошибка при удалении из друзей');
	  } finally {
	    setLoading(false);
	  }
	};

  if (!profile) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-purple-400 via-pink-400 to-teal-300 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Profile Info */}
      <div className="relative px-8 pb-8">
        {/* Avatar */}
        <div className="relative -mt-16 mb-6">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-purple-400 to-teal-300 flex items-center justify-center">
            <img
              src={getAvatarUrl(profile.avatarUrl)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
              <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-teal-400 text-white text-sm rounded-full font-medium">
                Участник.pro
              </div>
            </div>
            <p className="text-gray-600 text-lg mb-4">
              ✨ Коллекционер грез и исполнитель желаний | Исполняйте волшебство по одному желанию за раз 🌟
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Петрозаводск</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Присоединилась в марте 2023 года</span>
              </div>
              <div className="flex items-center gap-1">
                <Link className="w-4 h-4" />
                <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
                  {profile.email}
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
               {!isGuest && (
				  <div className="flex flex-col sm:flex-row gap-3">
				    {isFriend ? (
				      <div className="flex items-center gap-3">
				        <span className="text-green-600 font-semibold">В друзьях</span>
				        <button
				          onClick={handleRemoveFriend}
				          disabled={loading}
				          className="px-3 py-2 rounded-xl bg-gradient-to-r from-gray-500 to-teal-400 text-white hover:bg-red-600 transition"
				        >
				          {loading ? 'Удаление...' : 'Удалить из друзей'}
				        </button>
				      </div>
				    ) : (
				      <button
				        onClick={handleAddFriend}
				        disabled={loading}
				        className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-teal-400 text-white hover:from-purple-600 hover:to-teal-500 transition"
				      >
				        {loading ? 'Отправка...' : 'Добавить в друзья'}
				      </button>
				    )}
				    {error && <div className="text-red-500 mt-2">{error}</div>}
				    {success && <div className="text-green-500 mt-2">Запрос отправлен</div>}
				  </div>
				)}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-nowrap justify-center gap-6 mt-8 pt-6 border-t border-gray-100 overflow-x-auto">
            <div className="text-center min-w-[70px] sm:min-w-[120px]">
              <span className="text-sm sm:text-2xl font-bold text-purple-600">{ wishes.length }</span>
              <div className="text-xs sm:text-sm text-gray-500">
                {pluralize(wishes.length, 'желание', 'желания', 'желаний')}
              </div>
            </div>
            <div className="text-center min-w-[70px] sm:min-w-[120px]">
              <div className="text-sm sm:text-2xl font-bold text-teal-500">{ friends.length }</div>
              <div className="text-xs sm:text-sm text-gray-500">
	              {pluralize(friends.length, 'друг', 'друга', 'друзей')}
              </div>
            </div>
            <div className="text-center min-w-[70px] sm:min-w-[120px]">
              <div className="text-sm sm:text-2xl font-bold text-orange-500">23</div>
              <div className="text-xs sm:text-sm text-gray-500">
	              {pluralize(23, 'сообщество', 'сообщества', 'сообществ')}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserPageHeader;