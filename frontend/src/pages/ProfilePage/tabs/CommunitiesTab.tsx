import React from 'react';
import { Users, Crown, MessageCircle, TrendingUp, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STATIC_BASE_URL } from '../../../config';

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '/default-avatar.png';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${STATIC_BASE_URL}${imageUrl}`;
};

function pluralize(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

const CommunitiesTab: React.FC<FriendsTabProps> = ({ communities }) => {
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'Все категории' },
    { id: 'tech', name: 'Технологии' },
    { id: 'fashion', name: 'Мода' },
    { id: 'travel', name: 'Путешествия' },
    { id: 'books', name: 'Книги' },
    { id: 'health', name: 'Здоровье' },
    { id: 'art', name: 'Искусство' }
  ];

//   const communities = [
//     {
//       id: 1,
//       name: 'Любители фотографии',
//       description: 'Сообщество увлеченных фотографов, делящихся своим снаряжением, пожеланиями и советами',
//       avatar: 'https://avatars.mds.yandex.net/i?id=3be8cb7c15f5307fa7b522ead776f222_l-5554842-images-thumbs&n=13&w=400',
//       members: 12500,
//       role: 'Администратор',
//       activeWishlists: 45,
//       totalRaised: 25000,
//       joinDate: '2023-01-10',
//       isActive: true,
//       category: 'Фотография'
//     },
//     {
//       id: 2,
//       name: 'Коллектив цифрового искусства',
//       description: 'Художники поддерживают творческие поездки друг друга и приобретение инструментов',
//       avatar: 'https://avatars.mds.yandex.net/i?id=a384a635a2aa6f8b96a8c574d0834fec_l-5220021-images-thumbs&n=13&w=400',
//       members: 8200,
//       role: 'Модератор',
//       activeWishlists: 32,
//       totalRaised: 18500,
//       joinDate: '2023-02-15',
//       isActive: true,
//       category: 'Искусство'
//     },
//     {
//       id: 3,
//       name: 'Путешественники-искатели приключений',
//       description: 'Исследователи, помогающие друг другу финансировать удивительные путешествия',
//       avatar: 'https://avatars.mds.yandex.net/i?id=809317af397205976392a6c83b5e410c_l-9180497-images-thumbs&n=13&w=400',
//       members: 15800,
//       role: 'Участник',
//       activeWishlists: 67,
//       totalRaised: 42000,
//       joinDate: '2023-03-20',
//       isActive: true,
//       category: 'Путешествия'
//     },
//     {
//       id: 4,
//       name: 'Технические новаторы',
//       description: 'Энтузиасты технологий делятся передовыми гаджетами и финансируют их',
//       avatar: 'https://www.m24.ru/b/d/nBkSUhL2hFggnMewI76BrNOp2Z318Ji-mifGnuWR9mOBdDebBizCnTY8qdJf6ReJ58vU9meMMok3Ee2nhSR6ISeO9G1N_wjJ=OJVOlwo3B0uiUxkQsaiW_g.jpg&w=400',
//       members: 9500,
//       role: 'Участник',
//       activeWishlists: 28,
//       totalRaised: 35000,
//       joinDate: '2023-04-05',
//       isActive: false,
//       category: 'Техника'
//     },
//     {
//       id: 5,
//       name: 'Воины фитнеса',
//       description: 'Сообщество любителей здоровья и фитнеса поддерживает оборудование и цели тренировок',
//       avatar: 'https://avatars.mds.yandex.net/i?id=af05d6f995e2fc117e05f90899d6745b_l-3690429-images-thumbs&n=13&w=400',
//       members: 6300,
//       role: 'Участник',
//       activeWishlists: 23,
//       totalRaised: 12000,
//       joinDate: '2023-05-12',
//       isActive: true,
//       category: 'Фитнес'
//     },
//     {
//       id: 6,
//       name: 'Создатели музыки',
//       description: 'Музыканты помогают друг другу приобретать инструменты и студийное оборудование',
//       avatar: 'https://avatars.mds.yandex.net/i?id=1b20220bf89c4e7fc5726adacb0d69c3-5271179-images-thumbs&ref=rim&n=33&w=338&h=225&w=400',
//       members: 4800,
//       role: 'Участник',
//       activeWishlists: 19,
//       totalRaised: 8500,
//       joinDate: '2023-06-18',
//       isActive: true,
//       category: 'Музыка'
//     }
//   ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'Moderator':
        return <Crown className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'Moderator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Сообщества</h3>
        <button
		  onClick={() => navigate(`/communities`)}
		  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-lg font-medium hover:from-purple-600 hover:to-teal-500 transition-all duration-200 text-sm sm:text-base"
		>
		  Поиск сообществ
		</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {communities.map((community) => (
          <div key={community.id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
            {/* Community Header */}
            <div className="flex items-start gap-4 mb-4">
              {/* Картинка с навигацией */}
		        <div className="relative cursor-pointer" onClick={() => navigate(`/communities/${community.id}`)}>
		          <img
		            src={getImageUrl(community.image_url)}
		            alt={community.name}
		            className="w-16 h-16 rounded-xl object-cover"
		          />
		          <div
		            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
		              community.isActive ? "bg-green-500" : "bg-gray-400"
		            }`}
		          />
		        </div>
              
              <div className="flex-1">
		          <div className="flex items-center gap-2 mb-1">
		            {/* Название с навигацией */}
		            <h4
		              className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors cursor-pointer"
		              onClick={() => navigate(`/communities/${community.id}`)}
		            >
		              {community.name}
		            </h4>
		            {getRoleIcon(community.role)}
		          </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {community.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(community.role)}`}>
                    {community.role}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    {
					  categories.find(cat => cat.id === community.category)?.name || community.category
					  }
                  </span>
                </div>
              </div>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{formatNumber(community.members_count)}</span>
                </div>
                <div className="text-xs text-gray-500">
                    {pluralize(community.members_count, 'Участник', 'Участника', 'Участников')}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-teal-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-semibold">{community.wishes_count}</span>
                </div>
                <div className="text-xs text-gray-500">
                    {pluralize(community.wishes_count, 'Желание', 'Желания', 'Желаний')}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-pink-600 mb-1">
                  <span className="font-semibold">{formatCurrency(community.totalRaised)}</span>
                </div>
                <div className="text-xs text-gray-500">Собрано всего</div>
              </div>
            </div>

            {/* Join Date */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Calendar className="w-4 h-4" />
              <span>Основано: {new Date(community.created_at).toLocaleDateString('ru-RU', {
                month: 'long', 
                year: 'numeric' 
              })}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/communities/${community.id}`)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-lg font-medium hover:from-purple-600 hover:to-teal-500 transition-all duration-200 text-sm">
                Детали
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

export default CommunitiesTab;