import React from 'react';
import { STATIC_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '/default-avatar.png';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${STATIC_BASE_URL}${imageUrl}`;
};

interface Member {
  id: number;
  avatar_url?: string;
  name: string;
  role: string;
  isOnline: boolean;
  contributions: number;
}

interface CommunityMembersListProps {
  members: Member[];
  currentUserId: number; // id текущего пользователя
  getRoleColor: (role: string) => string;
  getRoleText: (role: string) => string;
  formatCurrency: (value: number) => string;
}

export default function CommunityMembersList({
  members,
  currentUserId,
  getRoleColor,
  getRoleText,
  formatCurrency,
}: CommunityMembersListProps) {
  const navigate = useNavigate();

  const handleNavigate = (memberId: number) => {
    if (memberId === currentUserId) {
      navigate('/profile');
    } else {
      navigate(`/users/${memberId}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {members.map((member) => (
        <div
          key={member.id}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div
              className="relative cursor-pointer"
              onClick={() => handleNavigate(member.id)}
              title={member.name}
            >
              <img
                src={getImageUrl(member.avatar_url)}
                alt={member.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
            </div>
            <div className="flex-1">
              <h3
                className="font-semibold text-gray-900 cursor-pointer"
                onClick={() => handleNavigate(member.id)}
                title={member.name}
              >
                {member.name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(member.role)}`}>
                  {getRoleText(member.role)}
                </span>
                <span className="text-xs text-gray-500">{member.isOnline ? 'Онлайн' : 'Офлайн'}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-1">Вклад в сообщество</div>
            <div className="text-lg font-semibold text-purple-600">
              {formatCurrency(member.contributions)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
