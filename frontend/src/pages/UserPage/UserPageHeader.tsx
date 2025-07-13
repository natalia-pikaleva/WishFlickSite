import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, MessageCircle, Settings, MapPin, Calendar, Link } from 'lucide-react';
import {
	fetchUserProfile,
	 } from '../../utils/api/userApi'
import { createNotification } from '../../utils/api/notificationsApi';

import { STATIC_BASE_URL } from '../../config';

interface UserPageHeaderProps {
  userId: number;
}

interface UserProfileData {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  description: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  isFriend: boolean;
}

const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return '/default-avatar.png';
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `${STATIC_BASE_URL}${avatarUrl}`;
};


const UserPageHeader: React.FC<UserPageHeaderProps> = ({ userId }) => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const currentUserId = Number(localStorage.getItem('user_id'));
  const currentUserName = localStorage.getItem('name') || 'Пользователь';

  useEffect(() => {
    fetchUserProfile(userId.toString()).then(data => {
      if (data) {
        setProfile(data);
      }
    });
  }, [userId]);

  const handleAddFriend = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    if (!currentUserId) {
      alert('Пользователь не авторизован');
      return;
    }
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
            <div className="flex flex-col sm:flex-row gap-3">
		        <button
		          onClick={handleAddFriend}
		          disabled={loading}
		          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium shadow-lg transition-all duration-200 transform hover:scale-105 ${
		            loading
		              ? 'bg-gray-400 cursor-not-allowed'
		              : 'bg-gradient-to-r from-purple-500 to-teal-400 text-white hover:from-purple-600 hover:to-teal-500 hover:shadow-xl'
		          }`}
		        >
		          <UserPlus className="w-5 h-5" />
		          {loading ? 'Отправка...' : 'Добавить в друзья'}
		        </button>
		    </div>

		    {error && <div className="text-red-500 mt-2">{error}</div>}
		    {success && <div className="text-green-500 mt-2">Запрос отправлен!</div>}
            {/*}<button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
              <MessageCircle className="w-5 h-5" />
              Сообщение
            </button>*/}
            {/* Настройки профиля */}
            {/*}<button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
              <Settings className="w-5 h-5" />
            </button>*/}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-nowrap justify-center gap-6 mt-8 pt-6 border-t border-gray-100 overflow-x-auto">
		  <div className="text-center min-w-[70px] sm:min-w-[120px]">
		    <div className="text-sm sm:text-2xl font-bold text-purple-600">127</div>
		    <div className="text-xs sm:text-sm text-gray-500">Желаний</div>
		  </div>
		  <div className="text-center min-w-[70px] sm:min-w-[120px]">
		    <div className="text-sm sm:text-2xl font-bold text-teal-500">1.2K</div>
		    <div className="text-xs sm:text-sm text-gray-500">Друзей</div>
		  </div>
		  <div className="text-center min-w-[70px] sm:min-w-[120px]">
		    <div className="text-sm sm:text-2xl font-bold text-orange-500">23</div>
		    <div className="text-xs sm:text-sm text-gray-500">Сообществ</div>
		  </div>
		</div>

      </div>
    </div>
  );
};

export default UserPageHeader;