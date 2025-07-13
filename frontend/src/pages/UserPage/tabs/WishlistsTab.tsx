import React, { useState, useEffect } from 'react';
import { Heart, Users, Calendar, ExternalLink } from 'lucide-react';
import { getUserWishesById, Wish } from '../../../utils/api/wishApi';
import { useNavigate } from 'react-router-dom';

interface WishlistsTabProps {
  userId: number;
}

const WishlistsTab: React.FC<WishlistsTabProps> = ({ userId }) => {
  const [wishlists, setWishlists] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishes = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('Пользователь не авторизован');

        // Используем userId для запроса желаний конкретного пользователя
        const wishes = await getUserWishesById(userId, token);
        setWishlists(wishes);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishes();
  }, [userId]);

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // В модели нет deadline, itemCount, contributors, category, поэтому убираем или заменяем
  // Для image используем image_url из API, если нет — плейсхолдер
  // Для isPublic используем is_public

  if (loading) return <div>Загрузка желаний...</div>;
  if (error) return <div className="text-red-600">Ошибка: {error}</div>;
  if (wishlists.length === 0) return <div>Желаний пока нет.</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {wishlists.map((wish) => (
          <div
            key={wish.id}
            className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 group"
          >
            <div className="relative">
              <img
                src={wish.image_url || '/default-image.png'}
                alt={wish.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    wish.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {wish.is_public ? 'Public' : 'Private'}
                </span>
                {/* Категория нет в API, можно убрать или добавить если есть */}
              </div>
            </div>

            <div className="p-5">
              <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {wish.title}
              </h4>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{wish.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{formatCurrency(wish.raised || 0)} собрано</span>
                  <span>{formatCurrency(wish.goal)} цель</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-teal-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(wish.raised || 0, wish.goal)}%` }}
                  />
                </div>
              </div>

              {/* Статистика — в API нет, можно убрать или заменить */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{/* Можно показать количество желаемых предметов, если есть */}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{/* Кол-во участников — нет в API */}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{/* Дата дедлайна — нет в API */}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-lg font-medium hover:from-purple-600 hover:to-teal-500 transition-all duration-200 text-sm">
                  Детали
                </button>
                <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistsTab;
