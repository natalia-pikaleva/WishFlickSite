import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, CheckCircle, User } from 'lucide-react';
import { STATIC_BASE_URL } from '../config';
import { getUsersList } from '../utils/api/userApi';
import { useAddFriend } from '../hooks/useAddFriend';

interface UserListItem {
  id: number;
  name: string;
  avatar_url?: string;
  isFriend: boolean;
  requestSent?: boolean;
}

const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return '/default-avatar.png';
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `${STATIC_BASE_URL}${avatarUrl}`;
};

const UsersListPage: React.FC = () => {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<UserListItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const isGuest = localStorage.getItem('isGuest') === 'true';

  const { addFriend, loading: loadingAddFriend, error, success } = useAddFriend();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUsersList();
        setUsers(data);
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setFiltered(
      users.filter(u =>
        u.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    );
  }, [search, users]);


  const handleAddFriendClick = async (id: number) => {
	  try {
	    await addFriend(id);
	    setUsers(users =>
	      users.map(u =>
	        u.id === id
	          ? { ...u, requestSent: true }
	          : u
	      )
	    );
	  } catch (error) {
	    // Можно добавить обработку ошибок, например alert
	    console.error('Ошибка при добавлении в друзья', error);
	  }
	};




  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Пользователи</h1>
      <div className="mb-6">
        <input
          type="text"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Поиск по имени..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loadingUsers ? (
        <div className="text-center text-gray-500 py-10">Загрузка...</div>
      ) : (
        <>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {success && <div className="text-green-500 mb-4">Запрос отправлен!</div>}

          <ul className="space-y-4">
            {filtered.length === 0 && (
              <li className="text-center text-gray-400">Нет пользователей</li>
            )}
            {filtered.map(user => (
              <li
                key={user.id}
                className="flex items-center bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm"
              >
                <Link to={`/users/${user.id}`}>
                  <img
                    src={getAvatarUrl(user.avatar_url)}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover mr-4 border border-gray-200 cursor-pointer"
                  />
                </Link>
                <div className="flex-1">
                  <Link
                    to={`/users/${user.id}`}
                    className="font-medium text-gray-900 hover:text-purple-600 transition-colors cursor-pointer"
                  >
                    {user.name}
                  </Link>
                </div>
                <div>
                {user.isFriend ? (
				  <span className="flex items-center gap-1 text-green-600 font-medium ml-4">
				    <CheckCircle className="w-5 h-5" />
				    <User className="w-5 h-5" />
				  </span>
				) : user.requestSent ? (
				  <span className="text-green-600 font-semibold ml-4">
				    Запрос в друзья отправлен
				  </span>
				) : (
				  <>
                  {!isGuest && (
					  <button
					  onClick={() => handleAddFriendClick(user.id)}
					  disabled={loadingAddFriend}
					  className="inline-flex items-center self-center px-3 py-1 max-h-10 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-lg font-medium hover:from-purple-600 hover:to-teal-500 transition-all duration-200 ml-4
					    text-xs sm:text-base"
					>
					  <UserPlus className="w-5 h-5" />
					  {loadingAddFriend ? 'Отправка...' : 'Добавить в друзья'}
					</button>
					  )}
				  </>
				)}


				</div>

              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};


export default UsersListPage;
