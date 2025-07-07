import React from 'react';
import { Heart, Users, DollarSign, Calendar, ExternalLink } from 'lucide-react';

const WishlistsTab: React.FC = () => {
  const wishlists = [
    {
      id: 1,
      title: 'Штатив для фотоаппарата',
      description: 'Создаю свою профессиональную фотостудию',
      itemCount: 8,
      raised: 2400,
      goal: 5000,
      contributors: 23,
      deadline: '2024-06-15',
      image: 'https://avatars.mds.yandex.net/i?id=acea17fb2080bfde9fd98e31f18c9e30_l-9234742-images-thumbs&ref=rim&n=13&w=750&h=750&w=400',
      isPublic: true,
      category: 'Электроника'
    },
    {
      id: 2,
      title: 'Коллекция художественных принадлежностей',
      description: 'Высококачественные художественные материалы для моего творческого путешествия',
      itemCount: 15,
      raised: 890,
      goal: 1200,
      contributors: 12,
      deadline: '2024-04-20',
      image: 'https://avatars.mds.yandex.net/i?id=d6680682a067bd0e1d1210d1c3d03a6c_l-4120686-images-thumbs&ref=rim&n=13&w=800&h=800&w=400',
      isPublic: false,
      category: 'Искусство'
    },
    {
      id: 3,
      title: 'Приключение туриста',
      description: 'Исследование Юго-Восточной Азии с необходимым снаряжением',
      itemCount: 12,
      raised: 3200,
      goal: 4500,
      contributors: 18,
      deadline: '2024-07-01',
      image: 'https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?q=80&w=5370&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=400',
      isPublic: true,
      category: 'Путешествия'
    }
  ];

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


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Желания</h3>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-lg font-medium hover:from-purple-600 hover:to-teal-500 transition-all duration-200">
          Создать новое
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {wishlists.map((wishlist) => (
          <div key={wishlist.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 group">
            <div className="relative">
              <img
                src={wishlist.image}
                alt={wishlist.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  wishlist.isPublic 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {wishlist.isPublic ? 'Public' : 'Private'}
                </span>
                <span className="px-2 py-1 bg-white bg-opacity-90 text-purple-600 text-xs font-medium rounded-full">
                  {wishlist.category}
                </span>
              </div>
            </div>

            <div className="p-5">
              <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {wishlist.title}
              </h4>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {wishlist.description}
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{formatCurrency(wishlist.raised)} собрано</span>
                  <span>{formatCurrency(wishlist.goal)} цель</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-teal-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(wishlist.raised, wishlist.goal)}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{wishlist.itemCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{wishlist.contributors} участников</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(wishlist.deadline)}</span>
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