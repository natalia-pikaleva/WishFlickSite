import React from 'react';

interface WishItem {
  id: number;
  title: string;
  description: string;
  image?: string;
  progress: number;
  raised: number;
  goal: number;
}

interface WishListProps {
  wishes: WishItem[];
  onRemove?: (id: number) => void;
  onViewDetails?: (id: number) => void;
}

const WishListProfile: React.FC<WishListProps> = ({ wishes, onRemove, onViewDetails }) => {
  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Мои желания</h3>
      <div className="grid md:grid-cols-2 gap-8">
        {wishes.map((wish) => (
          <div
            key={wish.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {wish.image && (
              <img
                src={wish.image}
                alt={wish.title}
                className="w-full h-48 object-cover"
                onError={e => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/fallback-image.png';
                }}
              />
            )}
            <div className="p-6">
              <h2
                onClick={() => onViewDetails && onViewDetails(wish.id)}
                className="text-2xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-[#6A49C8] transition-colors"
              >
                {wish.title}
              </h2>
              <p className="text-gray-600 mb-4">{wish.description}</p>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-700 mb-1">
                  <span>Собрано: {wish.raised} ₽</span>
                  <span>Цель: {wish.goal} ₽</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${wish.progress}%` }}
                  />
                </div>
              </div>

              {onViewDetails && (
                <button
                  type="button"
                  onClick={() => onViewDetails(wish.id)}
                  className="mb-3 w-full py-2 bg-[#6A49C8] text-white rounded-full font-semibold hover:bg-[#B48DFE] transition-colors duration-300"
                >
                  Посмотреть детали
                </button>
              )}

              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(wish.id)}
                  className="flex items-center justify-center gap-2 w-full py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors duration-300"
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishListProfile;
