import React, { useState, useEffect } from 'react';
import { Heart, Users, MessageSquare, Shield } from 'lucide-react';
import WishlistsTab from './tabs/WishlistsTab';
import PostsTab from './tabs/PostsTab';
import FriendsTab from './tabs/FriendsTab';
import CommunitiesTab from './tabs/CommunitiesTab';
import { getUserWishes } from '../../utils/api/wishApi';
import { getCurrentUserFriends } from '../../utils/api/friendsApi';
import { Wish } from '../types';

const ProfilePageTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wishlists' | 'posts' | 'friends' | 'communities'>('wishlists');
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [friends, setFriends] = useState<UserOut[]>([]);
  const [loadingWishes, setLoadingWishes] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Токен не найден. Пожалуйста, войдите в систему.');
      return;
    }

    const fetchWishes = async () => {
      setLoadingWishes(true);
      setError(null);
      try {
        const data = await getUserWishes(token);
        setWishes(data);
      } catch (e: any) {
        setError(e.message || 'Ошибка при загрузке желаний');
      } finally {
        setLoadingWishes(false);
      }
    };

    const fetchFriends = async () => {
      setLoadingFriends(true);
      setError(null);
      try {
        const data = await getCurrentUserFriends(token);
        setFriends(data);
      } catch (e: any) {
        setError(e.message || 'Ошибка при загрузке друзей пользователя');
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchWishes();
    fetchFriends();
  }, []);

  const tabs = [
    { id: 'wishlists', label: 'Желания', icon: Heart, count: wishes.length },
    { id: 'posts', label: 'Посты', icon: MessageSquare, count: 89 },
    { id: 'friends', label: 'Друзья', icon: Users, count: friends.length },
    { id: 'communities', label: 'Сообщества', icon: Shield, count: 23 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wishlists':
        if (loadingWishes) return <p>Загрузка желаний...</p>;
        if (error) return <p className="text-red-500">{error}</p>;
        return <WishlistsTab wishes={wishes} />;
      case 'posts':
        return <PostsTab />;
      case 'friends':
        return <FriendsTab friends={friends} />;
      case 'communities':
        return <CommunitiesTab />;
      default:
        return <WishlistsTab wishes={wishes} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tab Headers */}
      <div className="flex overflow-x-auto border-b border-gray-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
              <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">{renderTabContent()}</div>
    </div>
  );
};

export default ProfilePageTabs;
