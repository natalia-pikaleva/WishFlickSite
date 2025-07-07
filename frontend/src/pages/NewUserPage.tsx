import React from 'react';
import { UserPlus, MessageCircle, Settings, MapPin, Calendar, Link } from 'lucide-react';

const ProfileHeader: React.FC = () => {
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
              src="https://images.pexels.com/photos/3764119/pexels-photo-3764119.jpeg?auto=compress&cs=tinysrgb&w=400"
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
              <h1 className="text-3xl font-bold text-gray-900">Alexandra Chen</h1>
              <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-teal-400 text-white text-sm rounded-full font-medium">
                Pro Member
              </div>
            </div>
            <p className="text-gray-600 text-lg mb-4">
              ✨ Dream collector & wish granter | Making magic happen one wish at a time 🌟
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined March 2023</span>
              </div>
              <div className="flex items-center gap-1">
                <Link className="w-4 h-4" />
                <a href="#" className="text-purple-600 hover:text-purple-700 transition-colors">
                  alexchen.com
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl font-medium hover:from-purple-600 hover:to-teal-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              <UserPlus className="w-5 h-5" />
              Add Friend
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
              <MessageCircle className="w-5 h-5" />
              Message
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-6 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">127</div>
            <div className="text-sm text-gray-500">Wishes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-500">1.2K</div>
            <div className="text-sm text-gray-500">Friends</div>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-500">$2.4K</div>
              <div className="text-sm text-gray-500">Raised</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">23</div>
            <div className="text-sm text-gray-500">Communities</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;