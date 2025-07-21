import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Heart, TrendingUp, Filter, Plus } from 'lucide-react';
import { getCommunities, createCommunity } from '../utils/api/communityApi';
import { Community } from '../types';
import { STATIC_BASE_URL } from '../config';

interface CommunitiesProps {
  onCommunitySelect: (communityId: string) => void;
  token: string;
}

function pluralize(count, one, few, many) {
  const mod10 = count % 10, mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

const initialFormState = {
  name: '',
  description: '',
  category: 'tech',
  image: null as File | null,
  rules: '',
};

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '/default-avatar.png';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${STATIC_BASE_URL}${imageUrl}`;
};

const Communities: React.FC<CommunitiesProps> = ({ onCommunitySelect, token }) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCommunities();
  }, []);

  async function loadCommunities() {
    try {
      setLoading(true);
      const com = await getCommunities();
      setCommunities(com ?? []);
    } catch (e: any) {
      setCreateError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const categories = [
    { id: 'all', name: 'Все категории' },
    { id: 'tech', name: 'Технологии' },
    { id: 'fashion', name: 'Мода' },
    { id: 'travel', name: 'Путешествия' },
    { id: 'books', name: 'Книги' },
    { id: 'health', name: 'Здоровье' },
    { id: 'art', name: 'Искусство' }
  ];

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (community.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num?.toString() ?? '0';
  };

  async function handleCreateCommunity(event: React.FormEvent) {
    event.preventDefault();
    setCreateError('');
    try {
      if (!form.name || !form.category) {
        setCreateError('Укажите название и категорию');
        return;
      }
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('rules', form.rules);
      if (form.image) formData.append('image_file', form.image);

      const created = await createCommunity(token, formData);
      setShowCreateModal(false);
      setForm(initialFormState);
      await loadCommunities();
    } catch (e: any) {
      setCreateError(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent">
                WishFlick Сообщества
              </h1>
              <p className="text-gray-600 mt-1 text-sm">Присоединяйтесь к сообществам по интересам</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
              <div className="bg-gradient-to-r from-purple-500 to-teal-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium">
                <span>
                    {communities.length}{' '}
                    {pluralize(
					    communities ? communities.length : 0,
					    'сообщество',
					    'сообщества',
					    'сообществ'
					  )}
                </span>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden xs:inline">Создать</span>
                <span className="inline xs:hidden">Создать</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Поиск сообществ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div className="relative w-full md:w-auto">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-auto pl-10 pr-8 py-2 sm:py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white text-sm sm:text-base"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12 text-lg text-gray-500">Загрузка...</div>
        )}

        {/* Communities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCommunities.map((community) => (
            <div
              key={community.id}
              onClick={() => navigate(`/communities/${community.id}`)}
              className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-all duration-300 cursor-pointer transform active:scale-95 hover:-translate-y-1"
            >
              <div className="relative">
                <img
                  src={getImageUrl(community.image_url)}
                  alt={community.name}
                  className="w-full h-36 sm:h-44 md:h-48 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-medium text-gray-800">
                    {community.isActive ? 'Активное' : 'Неактивное'}
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">{community.name}</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{community.description}</p>

                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-2 sm:mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>
                        {formatNumber(community.members_count)}{' '}
						{pluralize(
						    community.members_count ? community.members_count : 0,
						    'участник',
						    'участника',
						    'участников'
						  )}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4" />
                    <span>
                        {community.wishes_count}{' '}
						{pluralize(
						    community.wishes_count ? community.wishes_count : 0,
						    'желание',
						    'желания',
						    'желаний'
						  )}
					</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-xs sm:text-sm text-green-600 font-medium">
                      {community.totalFunded} профинансировано
                    </span>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-teal-500 text-white px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium">
                    Войти
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCommunities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">Сообщества не найдены</div>
            <p className="text-gray-500 mt-2">Попробуйте изменить поисковый запрос или фильтр</p>
          </div>
        )}
      </div>

      {/* Модальное окно создания сообщества */}
      {showCreateModal && (
        <div className="fixed z-40 inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCommunity}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs sm:max-w-md mx-auto flex flex-col space-y-4 sm:space-y-6 relative"
          >
            <button
              type="button"
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowCreateModal(false)}
              aria-label="Закрыть"
            >×</button>
            <h2 className="text-lg sm:text-2xl font-semibold mb-2">Создать сообщество</h2>
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
              placeholder="Название"
              value={form.name}
              required
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <textarea
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
              placeholder="Описание"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
              value={form.category}
              required
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {categories.filter(c => c.id !== 'all').map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <textarea
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
              placeholder="Правила сообщества"
              value={form.rules}
              onChange={e => setForm(f => ({ ...f, rules: e.target.value }))}
            />
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:text-base"
              type="file"
              accept="image/*"
              onChange={e =>
                setForm(f => ({
                  ...f,
                  image: e.target.files && e.target.files[0] ? e.target.files[0] : null,
                }))
              }
            />

            {createError && <div className="text-red-500 text-sm">{createError}</div>}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white font-semibold py-2 rounded-lg transition"
              disabled={loading}
            >
              Создать
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Communities;
