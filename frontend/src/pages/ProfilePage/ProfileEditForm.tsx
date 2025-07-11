import React, { ChangeEvent, FormEvent } from 'react';
import ProfileAvatar from './ProfileAvatar';
import { updateUserProfile, ProfileData } from '../../utils/api/userApi';
import { STATIC_BASE_URL } from '../../config';

interface ProfileEditFormProps {
  profile: ProfileData;
  setProfile: React.Dispatch<React.SetStateAction<ProfileData | null>>;
  avatarFile: File | null;
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>;
  handleAvatarChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return '/default-avatar.png';
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `${STATIC_BASE_URL}${avatarUrl}`;
};

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profile,
  setProfile,
  avatarFile,
  setAvatarFile,
  handleAvatarChange,
  setIsEditing,
}) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleSocialChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? ({ ...prev, [`social_${name}`]: value }) : null);
  };

  const handlePrivacyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => prev ? ({ ...prev, privacy: e.target.value as 'public' | 'friends' | 'private' }) : null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Пожалуйста, войдите.');
      return;
    }

    const formData = new FormData();
    formData.append('name', profile?.name || '');
    formData.append('email', profile?.email || '');
    formData.append('description', profile?.description || '');
    formData.append('privacy', profile?.privacy || 'public');
    formData.append('social_facebook', profile?.social_facebook || '');
    formData.append('social_twitter', profile?.social_twitter || '');
    formData.append('social_instagram', profile?.social_instagram || '');
    formData.append('is_influencer', profile?.is_influencer ? 'true' : 'false');

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    try {
      const updatedProfile = await updateUserProfile(formData, token);
      setProfile(updatedProfile);
      setIsEditing(false);
      setAvatarFile(null);
      alert('Профиль обновлен!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Ошибка при обновлении профиля');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex flex-col items-center space-y-6">
      <div className="relative inline-block rounded-full p-[3px] bg-gradient-to-r from-[#B48DFE] to-[#98E2D5] mb-2">
        <ProfileAvatar
          profile={{ avatarUrl: profile?.avatar_url, name: profile?.name }}
          getAvatarUrl={getAvatarUrl}
          handleAvatarChange={handleAvatarChange}
        />
      </div>

      {/* Имя */}
      <div className="w-full">
        <label htmlFor="name" className="block font-medium mb-1">Имя</label>
        <input
          type="text"
          id="name"
          name="name"
          value={profile?.name || ''}
          onChange={handleInputChange}
          required
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE]"
          placeholder="Ваше имя"
        />
      </div>

      {/* Email */}
      <div className="w-full">
        <label htmlFor="email" className="block font-medium mb-1">Электронная почта</label>
        <input
          type="email"
          id="email"
          name="email"
          value={profile?.email || ''}
          onChange={handleInputChange}
          required
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE]"
          placeholder="you@example.com"
        />
      </div>

      {/* Описание */}
      <div className="w-full">
        <label htmlFor="description" className="block font-medium mb-1">Обо мне</label>
        <textarea
          id="description"
          name="description"
          value={profile?.description || ''}
          onChange={handleInputChange}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE]"
          placeholder="Расскажите о себе"
        />
      </div>

      {/* Настройки конфиденциальности */}
      <fieldset className="w-full">
        <legend className="font-medium mb-2">Настройки конфиденциальности</legend>
        <label className="inline-flex items-center mr-4">
          <input
            type="radio"
            name="privacy"
            value="public"
            checked={profile?.privacy === 'public'}
            onChange={handlePrivacyChange}
            className="form-radio"
          />
          <span className="ml-2">Публичный</span>
        </label>
        <label className="inline-flex items-center mr-4">
          <input
            type="radio"
            name="privacy"
            value="friends"
            checked={profile?.privacy === 'friends'}
            onChange={handlePrivacyChange}
            className="form-radio"
          />
          <span className="ml-2">Только для друзей</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            name="privacy"
            value="private"
            checked={profile?.privacy === 'private'}
            onChange={handlePrivacyChange}
            className="form-radio"
          />
          <span className="ml-2">Закрытый</span>
        </label>
      </fieldset>

      {/* Я блогер */}
      <div className="flex items-center space-x-2">
        <input
          id="isInfluencer"
          name="isInfluencer"
          type="checkbox"
          checked={profile?.is_influencer || false}
          onChange={(e) =>
            setProfile(prev => prev ? { ...prev, is_influencer: e.target.checked } : null)
          }
          className="form-checkbox h-5 w-5 text-[#6A49C8]"
        />
        <label htmlFor="isInfluencer" className="font-medium text-gray-700">Я блогер</label>
      </div>

      {/* Социальные ссылки */}
      <div className="w-full">
        <label htmlFor="social_facebook" className="block font-medium mb-1">Ссылка на профиль Facebook</label>
        <input
          type="url"
          id="social_facebook"
          name="facebook"
          value={profile?.social_facebook || ''}
          onChange={handleSocialChange}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE]"
          placeholder="https://facebook.com/yourprofile"
        />
      </div>

      <div className="w-full">
        <label htmlFor="social_twitter" className="block font-medium mb-1">Ссылка на профиль Twitter</label>
        <input
          type="url"
          id="social_twitter"
          name="twitter"
          value={profile?.social_twitter || ''}
          onChange={handleSocialChange}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE]"
          placeholder="https://twitter.com/yourprofile"
        />
      </div>

      <div className="w-full">
        <label htmlFor="social_instagram" className="block font-medium mb-1">Ссылка на профиль Instagram</label>
        <input
          type="url"
          id="social_instagram"
          name="instagram"
          value={profile?.social_instagram || ''}
          onChange={handleSocialChange}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE]"
          placeholder="https://instagram.com/yourprofile"
        />
      </div>

      {/* Кнопки */}
      <button
        type="submit"
        className="mt-6 px-6 py-2 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full hover:shadow-lg transition"
      >
        Сохранить
      </button>
      <button
        type="button"
        onClick={() => setIsEditing(false)}
        className="mt-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition"
      >
        Отмена
      </button>
    </form>
  );
};

export default ProfileEditForm;
