import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, MessageCircle, Users, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STATIC_BASE_URL } from '../../../config';

// Опишите тип для одного друга (можно расширить под ваши данные)
interface Friend {
  id: number;
  name: string;
  avatar_url?: string;
  isOnline: boolean;
  mutualFriends: number;
  recentActivity: string;
  joinDate: string;
  wishlistsCount: number;
  totalContributions: number;
}

interface FriendsTabProps {
  friends: Friend[];
}

const FriendsTab: React.FC<FriendsTabProps> = ({ friends }) => {
  const navigate = useNavigate();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  function getPluralForm(number: number, forms: [string, string, string]): string {
    const n = Math.abs(number) % 100;
    const n1 = n % 10;

    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} ${getPluralForm(diffDays, ['день', 'дня', 'дней'])} назад`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${getPluralForm(months, ['месяц', 'месяца', 'месяцев'])} назад`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${getPluralForm(years, ['год', 'года', 'лет'])} назад`;
    }
  };

  const getAvatarUrl = (avatarUrl?: string) => {
    if (!avatarUrl) return '/default-avatar.png';
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `${STATIC_BASE_URL}${avatarUrl}`;
  };

  const handleFindFriendsClick = () => {
    navigate('/users');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Друзья</h3>
        <button
          onClick={handleFindFriendsClick}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-lg font-medium hover:from-purple-600 hover:to-teal-500 transition-all duration-200"
        >
          Найти друзей
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {friends.map((friend) => (
          <div key={friend.id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
            {/* Friend Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <Link to={`/users/${friend.id}`}>
                  <img
                    src={getAvatarUrl(friend.avatar_url)}
                    alt={friend.name}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer"
                  />
                </Link>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  friend.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
              <div className="flex-1">
                {/* Оборачиваем имя в Link */}
                <Link
                  to={`/users/${friend.id}`}
                  className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors cursor-pointer"
                >
                  {friend.name}
                </Link>
                <p className="text-sm text-gray-500">
                  общих друзей {friend.mutualFriends}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {friend.recentActivity}
              </p>
            </div>

            {/* Friend Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="bg-purple-50 rounded-lg p-2">
                <div className="font-semibold text-purple-600">{friend.wishlistsCount}</div>
                <div className="text-xs text-gray-500">Желаний</div>
              </div>
              <div className="bg-teal-50 rounded-lg p-2">
                <div className="font-semibold text-teal-600">
                  {/*{formatCurrency(friend.totalContributions)}*/}
                  Инфо о друге 1
                </div>
                {/*<div className="text-xs text-gray-500">Собрано</div>*/}
              </div>
              <div className="bg-pink-50 rounded-lg p-2">
                <div className="font-semibold text-pink-600">
                  {/*{getTimeAgo(friend.joinDate)}*/}
                  Инфо о друге 2
                </div>
                {/*<div className="text-xs text-gray-500">Присоединился</div>*/}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-lg font-medium hover:from-purple-600 hover:to-teal-500 transition-all duration-200 text-sm">
                <Gift className="w-4 h-4" />
                Поддержать
              </button>
              <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsTab;


//   const friends = [
//     {
//       id: 1,
//       name: 'Анна Иванова',
//       avatar: 'https://avatars.mds.yandex.net/i?id=41d6b2f37aabad1cc9e21afec7bb3b284cd7c3ff-9042801-images-thumbs&ref=rim&n=33&w=213&h=250&w=400',
//       isOnline: true,
//       mutualFriends: 12,
//       recentActivity: 'Внесла свой вклад в ваш список пожеланий по фотографии',
//       joinDate: '2025-01-15',
//       wishlistsCount: 8,
//       totalContributions: 450
//     },
//     {
//       id: 2,
//       name: 'Михаил Соколов',
//       avatar: 'https://sun9-38.userapi.com/impg/pCItRA8JO2kA2W9hTBXltA4ZPy_98AdIvR2BEw/3X-azIZnd-A.jpg?size=747x749&quality=95&sign=a61a2700d822fa20f66b49c0e7a9e9e5&c_uniq_tag=CDR8vHaOl7RI2KcC4WZff4kYea_hHrTe2ukgT2l510M&type=album&w=400',
//       isOnline: false,
//       mutualFriends: 8,
//       recentActivity: 'Создан новый список пожеланий: Игровая установка',
//       joinDate: '2023-02-20',
//       wishlistsCount: 5,
//       totalContributions: 780
//     },
//     {
//       id: 3,
//       name: 'Екатерина Канарская',
//       avatar: 'https://avatars.mds.yandex.net/i?id=2630e173ad0e62c6ae15cd263b394301cc586664-5878586-images-thumbs&n=13&w=400',
//       isOnline: true,
//       mutualFriends: 15,
//       recentActivity: 'Понравился ваш недавний пост',
//       joinDate: '2025-06-10',
//       wishlistsCount: 12,
//       totalContributions: 1200
//     },
//     {
//       id: 4,
//       name: 'Павел Мельников',
//       avatar: 'https://avatars.mds.yandex.net/i?id=cb054ae06b2be168a8a2fd1911a5943be889f930-5267154-images-thumbs&ref=rim&n=33&w=444&h=250&w=400',
//       isOnline: false,
//       mutualFriends: 6,
//       recentActivity: 'Поделился своим списком желаний о путешествии',
//       joinDate: '2023-03-05',
//       wishlistsCount: 15,
//       totalContributions: 920
//     },
//     {
//       id: 5,
//       name: 'Елизавета Михайловская',
//       avatar: 'https://avatars.mds.yandex.net/i?id=96d8794b98d8ba45eda5f47c05401471_l-10490937-images-thumbs&n=13&w=400',
//       isOnline: true,
//       mutualFriends: 20,
//       recentActivity: 'Пополнила свой список пожеланий по художественным принадлежностям',
//       joinDate: '2022-09-12',
//       wishlistsCount: 18,
//       totalContributions: 2100
//     },
//     {
//       id: 6,
//       name: 'Денис Хлебников',
//       avatar: 'https://avatars.mds.yandex.net/i?id=3b7818152d7b26359faa0d2d7616c651_l-4415285-images-thumbs&n=13&w=400',
//       isOnline: false,
//       mutualFriends: 4,
//       recentActivity: 'Добавлен новый пункт в список желаний для фитнеса',
//       joinDate: '2024-04-18',
//       wishlistsCount: 6,
//       totalContributions: 340
//     }
//   ];
