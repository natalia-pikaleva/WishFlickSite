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
      <div className="grid gap-6 md:grid-cols-2">
        {communities.map((community) => (
          <div key={community.id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
            {/* Community Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <img
                  src={getImageUrl(community.image_url)}
                  alt={community.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  community.isActive ? 'bg-green-500' : 'bg-gray-400'
                }` } />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
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