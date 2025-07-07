import React from 'react';
import { UserPlus, MessageCircle, Settings, MapPin, Calendar, Link } from 'lucide-react';

const UserPageHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-purple-400 via-pink-400 to-teal-300 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Profile Info */}
      <div className="relative px-8 pb-8">
        {/* Avatar */}
        <div className="relative -mt-16 mb-6">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-purple-400 to-teal-300 flex items-center justify-center">
            <img
              src="https://avatars.mds.yandex.net/i?id=27a07fc7d3d209e395abce88607a0c51b280ad37-4507619-images-thumbs&n=13&w=400"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Александра Петрова</h1>
              <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-teal-400 text-white text-sm rounded-full font-medium">
                Участник.pro
              </div>
            </div>
            <p className="text-gray-600 text-lg mb-4">
              ✨ Коллекционер грез и исполнитель желаний | Исполняйте волшебство по одному желанию за раз 🌟
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Петрозаводск</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Присоединилась в марте 2023 года</span>
              </div>
              <div className="flex items-center gap-1">
                <Link className="w-4 h-4" />
                <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
                  natalia@pikaleva.com
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl font-medium hover:from-purple-600 hover:to-teal-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              <UserPlus className="w-5 h-5" />
              Добавить в друзья
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
              <MessageCircle className="w-5 h-5" />
              Сообщение
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-nowrap justify-center gap-6 mt-8 pt-6 border-t border-gray-100 overflow-x-auto">
		  <div className="text-center min-w-[70px] sm:min-w-[120px]">
		    <div className="text-sm sm:text-2xl font-bold text-purple-600">127</div>
		    <div className="text-xs sm:text-sm text-gray-500">Желаний</div>
		  </div>
		  <div className="text-center min-w-[70px] sm:min-w-[120px]">
		    <div className="text-sm sm:text-2xl font-bold text-teal-500">1.2K</div>
		    <div className="text-xs sm:text-sm text-gray-500">Друзей</div>
		  </div>
		  <div className="text-center min-w-[70px] sm:min-w-[120px]">
		    <div className="text-sm sm:text-2xl font-bold text-orange-500">23</div>
		    <div className="text-xs sm:text-sm text-gray-500">Сообществ</div>
		  </div>
		</div>

      </div>
    </div>
  );
};

export default UserPageHeader;