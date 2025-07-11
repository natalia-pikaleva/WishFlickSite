import React, { useRef } from 'react';
import { STATIC_BASE_URL } from '../../config';

interface ProfileProps {
  profile: {
    avatarUrl?: string;
    name?: string;
  };
  getAvatarUrl: (url?: string) => string;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileAvatar: React.FC<ProfileProps> = ({ profile, getAvatarUrl, handleAvatarChange }) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative inline-block rounded-full p-[2px] bg-gradient-to-r from-[#B48DFE] to-[#98E2D5]">
      {/* Внутренний контейнер с фоном и аватаркой */}
      <div className="bg-white rounded-full overflow-hidden w-32 h-32">
        {profile.avatarUrl ? (
          <img
            src={getAvatarUrl(profile.avatarUrl)}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-3xl font-bold text-gray-600">
            {profile.name ? profile.name.slice(0, 2).toUpperCase() : '??'}
          </span>
        )}
      </div>

      {/* Кнопка с камерой */}
      <button
        type="button"
        onClick={() => avatarInputRef.current?.click()}
        title="Изменить фото"
        className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-r from-[#B48DFE] to-[#98E2D5] text-white shadow-md hover:brightness-110 transition"
      >
        📷
      </button>

      <input
        type="file"
        ref={avatarInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
    </div>
  );
};

export default ProfileAvatar;
