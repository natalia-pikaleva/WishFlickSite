import React, { useState } from 'react';
import WishListProfile from './WishListProfile';

interface WishItem {
  id: number;
  title: string;
  description: string;
  image?: string;
  progress: number;
  raised: number;
  goal: number;
}

interface ProfileTabsProps {
  wishes: WishItem[];
  friendsCount: number;
  onRemove?: (id: number) => void;
  onViewDetails?: (id: number) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ wishes, friendsCount, onRemove, onViewDetails }) => {
  const [activeTab, setActiveTab] = useState<'wishlists' | 'posts' | 'friends'>('wishlists');

  return (
    <>
      <div className="profile-tabs flex space-x-4 mt-6 border-b">
        <button
          className={`tab-btn pb-2 ${activeTab === 'wishlists' ? 'border-b-2 border-purple-600 font-semibold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('wishlists')}
        >
          Вишлисты ({wishes.length})
        </button>
        <button
          className={`tab-btn pb-2 ${activeTab === 'posts' ? 'border-b-2 border-purple-600 font-semibold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('posts')}
        >
          Посты
        </button>
        <button
          className={`tab-btn pb-2 ${activeTab === 'friends' ? 'border-b-2 border-purple-600 font-semibold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('friends')}
        >
          Друзья ({friendsCount})
        </button>
      </div>

      <div className="tab-content mt-4">
        {activeTab === 'wishlists' && (
          <WishListProfile wishes={wishes} onRemove={onRemove} onViewDetails={onViewDetails} />
        )}

        {activeTab === 'posts' && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Мои Посты</h3>
            <p className="text-gray-600">Функционал постов находится в разработке.</p>
          </div>
        )}

        {activeTab === 'friends' && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Мои Друзья</h3>
            <p className="text-gray-600">Список друзей находится в разработке.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileTabs;
