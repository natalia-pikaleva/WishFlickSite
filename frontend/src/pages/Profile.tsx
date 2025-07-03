import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { API_BASE_URL, STATIC_BASE_URL } from '../config';
import WishList from './Profile_components/WishListProfile';

type PrivacySetting = 'public' | 'friends' | 'private';

interface UserProfileData {
  name: string;
  email: string;
  avatarUrl: string;
  description: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  privacy: PrivacySetting;
  isInfluencer: boolean;  // новое поле
}

const defaultProfile: UserProfileData = {
  name: '',
  email: '',
  avatarUrl: '',
  description: '',
  socialLinks: {},
  privacy: 'public',
  isInfluencer: false,  // по умолчанию false
};

const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return '/default-avatar.png';
  if (avatarUrl.startsWith('http') || avatarUrl.startsWith('https')) {
    return avatarUrl;
  }
  return `${STATIC_BASE_URL}${avatarUrl}`;
};

const Profile = () => {
  const [profile, setProfile] = useState<UserProfileData>(defaultProfile);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('Please login first');
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;

        setProfile({
		  name: data.name || '',
		  email: data.email || '',
		  avatarUrl: data.avatar_url || '',
		  description: data.description || '',
		  socialLinks: {
		    facebook: data.social_facebook || '',
		    twitter: data.social_twitter || '',
		    instagram: data.social_instagram || '',
		  },
		  privacy: data.privacy || 'public',
		  isInfluencer: data.is_influencer || false,
		});

      } catch (error) {
        alert('Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

	// Очистка созданного URL для аватара при размонтировании или изменении
  useEffect(() => {
    return () => {
      if (profile.avatarUrl && avatarFile) {
        URL.revokeObjectURL(profile.avatarUrl);
      }
    };
  }, [profile.avatarUrl, avatarFile]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }));
  };

  const handlePrivacyChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({
      ...prev,
      privacy: e.target.value as PrivacySetting,
    }));
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      const url = URL.createObjectURL(e.target.files[0]);
      setProfile(prev => ({
        ...prev,
        avatarUrl: url,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please login first');
      return;
    }
    const formDataToSend = new FormData();
    formDataToSend.append('name', profile.name || '');
    formDataToSend.append('email', profile.email || '');
    formDataToSend.append('description', profile.description || '');
    formDataToSend.append('privacy', profile.privacy || 'public');
    formDataToSend.append('social_facebook', profile.socialLinks.facebook || '');
    formDataToSend.append('social_twitter', profile.socialLinks.twitter || '');
    formDataToSend.append('social_instagram', profile.socialLinks.instagram || '');
    if (avatarFile) {
      formDataToSend.append('avatar', avatarFile);
    }
	formDataToSend.append('is_influencer', profile.isInfluencer ? 'true' : 'false');

    try {
  const response = await axios.put(`${API_BASE_URL}/profile`, formDataToSend, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  console.log('Profile updated:', response.data);
  alert('Profile updated!');
  setProfile({
    ...response.data,
    avatarUrl: response.data.avatar_url || '',
    socialLinks: {
      facebook: response.data.social_facebook || '',
      twitter: response.data.social_twitter || '',
      instagram: response.data.social_instagram || '',
    },
  });
  setIsEditing(false);
} catch (error: any) {
  alert(error.response?.data?.detail || 'Failed to update profile');
}
};

  return (
    <main className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
	  <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Профиль</h1>

	  {!isEditing ? (
	    <div className="flex flex-col md:flex-row md:space-x-8">
	      {/* Левая колонка: информация и кнопка */}
	      <div className="md:w-1/2 text-center md:text-left">
	        {profile.avatarUrl ? (
	          <img
	            src={getAvatarUrl(profile.avatarUrl)}
	            alt="Avatar"
	            className="w-32 h-32 rounded-full mx-auto md:mx-0 mb-4 object-cover"
	          />
	        ) : (
	          <div className="w-32 h-32 rounded-full mx-auto md:mx-0 mb-4 bg-gray-200 flex items-center justify-center text-gray-400">
	            Нет аватарки
	          </div>
	        )}
	        <h2 className="text-xl font-semibold">{profile.name || 'No Name'}</h2>
	        <p className="text-gray-600">{profile.email}</p>
	        <p className="mt-4">{profile.description}</p>
	        <div className="mt-4 space-x-4">
	          {profile.socialLinks.facebook && (
	            <a
	              href={profile.socialLinks.facebook}
	              target="_blank"
	              rel="noreferrer"
	              className="text-blue-600 hover:underline"
	            >
	              Facebook
	            </a>
	          )}
	          {profile.socialLinks.twitter && (
	            <a
	              href={profile.socialLinks.twitter}
	              target="_blank"
	              rel="noreferrer"
	              className="text-blue-400 hover:underline"
	            >
	              Twitter
	            </a>
	          )}
	          {profile.socialLinks.instagram && (
	            <a
	              href={profile.socialLinks.instagram}
	              target="_blank"
	              rel="noreferrer"
	              className="text-pink-600 hover:underline"
	            >
	              Instagram
	            </a>
	          )}
	        </div>
	        <p className="mt-4 font-medium">Privacy: {profile.privacy}</p>
	        <button
	          onClick={() => setIsEditing(true)}
	          className="mt-6 px-6 py-2 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full hover:shadow-lg transition"
	        >
	          Редактировать профиль
	        </button>
	      </div>

	      {/* Правая колонка: Мои желания */}
	      <WishList wishes={profile.wishes} />
	    </div>
	  ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 mb-2 flex items-center justify-center text-gray-400">
                Нет аватарки
              </div>
            )}

            <input
		        type="file"
		        accept="image/*"
		        id="avatarFile"
		        onChange={handleAvatarChange}
		        className="hidden"
		      />
		      <label
		        htmlFor="avatarFile"
                className="mt-6 px-6 py-2 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full hover:shadow-lg transition"
				>
		        Выберите файл
		      </label>
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="name">
              Имя
            </label>
            <input
              id="name"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE]"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="email">
              Электронная почта
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="description">
              Обо мне
            </label>
            <textarea
              id="description"
              name="description"
              value={profile.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE]"
              placeholder="Tell us about yourself"
            />
          </div>

          <fieldset>
            <legend className="font-medium mb-2">Настройки конфиденциальности</legend>
            <label className="inline-flex items-center mr-4">
              <input
                type="radio"
                name="privacy"
                value="public"
                checked={profile.privacy === 'public'}
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
                checked={profile.privacy === 'friends'}
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
                checked={profile.privacy === 'private'}
                onChange={handlePrivacyChange}
                className="form-radio"
              />
              <span className="ml-2">Закрытый</span>
            </label>
          </fieldset>
		  <div className="flex items-center space-x-2">
			  <input
			    id="isInfluencer"
			    name="isInfluencer"
			    type="checkbox"
			    checked={profile.isInfluencer}
			    onChange={(e) =>
			      setProfile(prev => ({ ...prev, isInfluencer: e.target.checked }))
			    }
			    className="form-checkbox h-5 w-5 text-[#6A49C8]"
			  />
			  <label htmlFor="isInfluencer" className="font-medium text-gray-700">
			    Я блогер
			  </label>
			</div>

          <div>
            <label className="block font-medium mb-1" htmlFor="facebook">
              ссылка на профиль Facebook
            </label>
            <input
              id="facebook"
              name="facebook"
              type="url"
              value={profile.socialLinks.facebook || ''}
              onChange={handleSocialChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE]"
              placeholder="https://facebook.com/yourprofile"
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="twitter">
              Ссылка на профиль Twitter
            </label>
            <input
              id="twitter"
              name="twitter"
              type="url"
              value={profile.socialLinks.twitter || ''}
              onChange={handleSocialChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE]"
              placeholder="https://twitter.com/yourprofile"
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="instagram">
              Ссылка на профиль Instagram
            </label>
            <input
              id="instagram"
              name="instagram"
              type="url"
              value={profile.socialLinks.instagram || ''}
              onChange={handleSocialChange}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE]"
              placeholder="https://instagram.com/yourprofile"
            />
          </div>

          <button
            type="submit"
            className="mt-6 px-6 py-2 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full hover:shadow-lg transition"
          >
            Сохранить
          </button>
        </form>
      )}
    </main>
  );
};

export default Profile;