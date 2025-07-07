import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Users, Heart } from 'lucide-react';
import { API_BASE_URL, STATIC_BASE_URL } from '../config';

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

interface WishItem {
  id: number;
  title: string;
  progress: number;
  raised: number;
  goal: number;
  supporters: number;
  image: string;
}

interface PostItem {
  id: number;
  content: string;
  date: string;
}

const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return '/default-avatar.png';
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `${STATIC_BASE_URL}${avatarUrl}`;
};

const UserProfilePage: React.FC<{ userId: number }> = ({ userId }) => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isFriend, setIsFriend] = useState(false);
  const [loadingFriendAction, setLoadingFriendAction] = useState(false);

  useEffect(() => {
    // Загрузка данных пользователя
    async function fetchProfile() {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/${userId}`);
        const data = res.data;
        setProfile({
          id: data.id,
          name: data.name,
          email: data.email,
          avatarUrl: data.avatar_url,
          description: data.description,
          socialLinks: {
            facebook: data.social_facebook,
            twitter: data.social_twitter,
            instagram: data.social_instagram,
          },
          isFriend: data.is_friend,
        });
        setIsFriend(data.is_friend);
      } catch (e) {
        alert('Ошибка при загрузке профиля');
      }
    }

    // Загрузка желаний пользователя
    async function fetchWishes() {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/${userId}/wishes`);
        const wishesData = res.data.map((wish: any) => ({
          id: wish.id,
          title: wish.title,
          progress: wish.goal > 0 ? Math.round((wish.raised / wish.goal) * 100) : 0,
          raised: wish.raised,
          goal: wish.goal,
          supporters: wish.supporters_count,
          image: wish.image_url || '/default-wish.jpg',
        }));
        setWishes(wishesData);
      } catch {
        alert('Ошибка при загрузке желаний');
      }
    }

    // Загрузка постов пользователя
    async function fetchPosts() {
      try {
        const res = await axios.get(`${API_BASE_URL}/users/${userId}/posts`);
        setPosts(res.data);
      } catch {
        alert('Ошибка при загрузке постов');
      }
    }

    fetchProfile();
    fetchWishes();
    fetchPosts();
  }, [userId]);

  const handleAddFriend = async () => {
    if (!profile) return;
    setLoadingFriendAction(true);
    try {
      // Пример запроса на добавление в друзья
      await axios.post(`${API_BASE_URL}/friends/request`, { friendId: profile.id });
      setIsFriend(true);
      alert('Запрос на добавление в друзья отправлен!');
    } catch {
      alert('Ошибка при добавлении в друзья');
    } finally {
      setLoadingFriendAction(false);
    }
  };

  if (!profile) {
    return <div className="p-10 text-center text-gray-500">Загрузка профиля...</div>;
  }

  return (
    <main className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <div className="flex flex-col md:flex-row md:space-x-10">
        {/* Левая колонка: аватар и инфо */}
        <div className="md:w-1/3 flex flex-col items-center md:items-start">
          <div className="relative rounded-full p-[3px] bg-gradient-to-r from-[#B48DFE] to-[#98E2D5] mb-4">
            <div className="bg-white rounded-full overflow-hidden w-40 h-40">
              <img
                src={getAvatarUrl(profile.avatarUrl)}
                alt={`${profile.name} avatar`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          <p className="text-gray-600">{profile.email}</p>
          <p className="mt-4 text-center md:text-left">{profile.description}</p>

          <div className="flex space-x-4 mt-4">
            {profile.socialLinks.facebook && (
              <a href={profile.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                Facebook
              </a>
            )}
            {profile.socialLinks.twitter && (
              <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                Twitter
              </a>
            )}
            {profile.socialLinks.instagram && (
              <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-pink-600 hover:underline">
                Instagram
              </a>
            )}
          </div>

          {/* Кнопка Добавить в друзья */}
          {!isFriend ? (
            <button
              onClick={handleAddFriend}
              disabled={loadingFriendAction}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full hover:shadow-lg transition disabled:opacity-50"
            >
              {loadingFriendAction ? 'Отправка...' : 'Добавить в друзья'}
            </button>
          ) : (
            <button
              disabled
              className="mt-6 px-6 py-2 bg-gray-300 text-gray-700 rounded-full cursor-default"
            >
              В друзьях
            </button>
          )}
        </div>

        {/* Правая колонка: желания и посты */}
        <div className="md:w-2/3 space-y-10">
          {/* Желания */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-2">
              <Heart className="w-6 h-6 text-pink-500" />
              <span>Желания</span>
            </h2>
            {wishes.length === 0 ? (
              <p className="text-gray-500">У пользователя пока нет желаний.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {wishes.map((wish) => (
                  <div key={wish.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer">
                    <img src={wish.image} alt={wish.title} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{wish.title}</h3>
                      <div className="text-sm text-gray-600 mb-2">
                        Поддержали: {wish.supporters} человек
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] h-2 rounded-full"
                          style={{ width: `${wish.progress}%` }}
                        />
                      </div>
                      <div className="text-sm font-semibold">
                        {wish.raised} ₽ / {wish.goal} ₽
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Посты пользователя */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center space-x-2">
              <Users className="w-6 h-6 text-purple-600" />
              <span>Посты пользователя</span>
            </h2>
            {posts.length === 0 ? (
              <p className="text-gray-500">Пользователь еще не публиковал постов.</p>
            ) : (
              <ul className="space-y-6">
                {posts.map((post) => (
                  <li key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <p className="mb-2">{post.content}</p>
                    <time className="text-xs text-gray-400">{new Date(post.date).toLocaleDateString()}</time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default UserProfilePage;
