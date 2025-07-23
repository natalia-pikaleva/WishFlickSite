import { Camera, Users, Heart, TrendingUp, Share2, Settings } from 'lucide-react';

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '/default-avatar.png';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${STATIC_BASE_URL}${imageUrl}`;
};

function pluralize(count, one, few, many) {
  const mod10 = count % 10, mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export default function CommunityHeader({
  community,
  isAdmin,
  membersCount,
  wishesCount,
  onShare,
  onSettings,
  onBack,
  getImageUrl,
  formatNumber,
  showJoinBtn,
  onJoinClick,
  pending,
  success,
  errorMsg,
}) {
  return (
    <div>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-purple-600 text-sm sm:text-base"
            >
              <span className="inline-block">←</span>
              <span className="hidden xs:inline">Назад к сообществам</span>
            </button>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-1 sm:gap-2 bg-purple-100 text-purple-700 px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-purple-200 text-xs sm:text-sm"
                onClick={onShare}
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden xs:inline">Поделиться</span>
              </button>
              {isAdmin && (
                <button
                  className="flex items-center gap-1 sm:gap-2 bg-gray-100 text-gray-700 px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-gray-200 text-xs sm:text-sm"
                  onClick={onSettings}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden xs:inline">Настройки</span>
                </button>
              )}
		      {showJoinBtn && (
                <button
                  onClick={onJoinClick}
                  className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-purple-500 to-teal-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg hover:from-purple-600 hover:to-teal-600 text-xs sm:text-sm font-semibold shadow"
                  disabled={pending || success}
                >
                  {success ? "Заявка отправлена" : pending ? "Отправка..." : "Вступить"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Community Bg и карточка */}
      <div className="relative">
        <div className="h-44 sm:h-64 bg-gradient-to-r from-purple-600 to-teal-500 overflow-hidden">
          <img
            src={getImageUrl(community.image_url)}
            alt={community.name}
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-teal-500/80" />
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-end gap-4 sm:gap-6">
              <div className="relative flex-shrink-0">
                <img
                  src={getImageUrl(community.image_url)}
                  alt={community.name}
                  className="w-20 h-20 sm:w-32 sm:h-32 rounded-xl border-4 border-white shadow-lg"
                />
                {/* Кнопка камеры только на десктопах */}
                <button className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-white rounded-full p-1 sm:p-2 shadow-lg hover:shadow-xl transition-shadow">
                  <Camera className="h-4 w-4 text-purple-600" />
                </button>
              </div>
              <div className="text-white pb-2 sm:pb-4">
                <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2 break-words">{community.name}</h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 sm:gap-y-0 text-purple-100 text-xs sm:text-base">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>
					  {membersCount ? formatNumber(membersCount) : 0}{' '}
					  {pluralize(
					    membersCount ? membersCount : 0,
					    'участник',
					    'участника',
					    'участников'
					  )}
					</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>
					  {wishesCount ? formatNumber(wishesCount) : 0}{' '}
					  {pluralize(
					    wishesCount ? wishesCount : 0,
					    'желание',
					    'желания',
					    'желаний'
					  )}
					</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{community.totalFunded} профинансировано</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
