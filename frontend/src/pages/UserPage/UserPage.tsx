import React, { useState, useEffect } from 'react';
import UserPageHeader from './UserPageHeader';
import UserPageTabs from './UserPageTabs';
import { getUserWishesById } from '../../utils/api/wishApi';
import { getUserFriendsById } from '../../utils/api/friendsApi';
import { getUserCommunities } from '../../utils/api/communityApi'
import { Community } from '../types'

interface UserPageProps {
  userId: number;
}

const UserPage: React.FC<UserPageProps> = ({ userId }) => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [friends, setFriends] = useState<UserOut[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);

  const [loadingWishes, setLoadingWishes] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
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
        const data = await getUserWishesById(userId, token);
        setWishes(data);
      } catch (e: any) {
        setError(e.message || 'Ошибка при загрузке желаний пользователя');
      } finally {
        setLoadingWishes(false);
      }
    };

    const fetchFriends = async () => {
      setLoadingFriends(true);
      setError(null);
      try {
        const data = await getUserFriendsById(userId, token);
        setFriends(data);
      } catch (e: any) {
        setError(e.message || 'Ошибка при загрузке друзей пользователя');
      } finally {
        setLoadingFriends(false);
      }
    };

    const fetchCommunities = async () => {
      setLoadingCommunities(true);
      setError(null);
      try {
        const data = await getUserCommunities(token, userId);
        setCommunities(data);
      } catch (e: any) {
        setError(e.message || 'Ошибка при загрузке сообществ пользователя');
      } finally {
        setLoadingCommunities(false);
      }
    };

    fetchWishes();
    fetchFriends();
    fetchCommunities();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <UserPageHeader
      userId={userId}
      friends={friends}
      wishes={wishes}
      communities={communities}/>
      <UserPageTabs
      userId={userId}
      wishes={wishes}
	  friends={friends}
	  communities={communities}
	  loadingWishes={loadingWishes}
	  loadingFriends={loadingFriends}
	  loadingCommunities={loadingCommunities}
	  error={error}
	  />
    </div>
  );
};

export default UserPage;