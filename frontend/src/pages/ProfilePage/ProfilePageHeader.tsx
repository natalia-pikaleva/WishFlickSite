import React, { useState, useEffect, ChangeEvent  } from 'react';
import { UserPlus, MapPin, Calendar, Link, Settings } from 'lucide-react';
import { updateUserProfile, uploadUserAvatar, getUserProfile } from '../../utils/api/userApi'
import { STATIC_BASE_URL } from '../../config';
import ProfileAvatar from './ProfileAvatar';
import ProfileEditForm from './ProfileEditForm';
import { ProfileData, UserOut, Wish, Community } from '../types';



interface ProfilePageHeaderProps {
  friends: UserOut[];
  wishes: Wish[];
  communities: Community[];
}

const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return '/default-avatar.png';
  if (avatarUrl.startsWith('http')) return avatarUrl;
  return `${STATIC_BASE_URL}${avatarUrl}`;
};

function pluralize(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

const ProfilePageHeader: React.FC = ({ wishes, friends, communities }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Пользователь не авторизован');
      setLoading(false);
      return;
    }

    getUserProfile(token)
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Ошибка загрузки профиля');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
	  return () => {
	    if (profile?.avatar_url && avatarFile) {
	      URL.revokeObjectURL(profile.avatar_url);
	    }
	  };
	}, [profile?.avatar_url, avatarFile]);


  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      const url = URL.createObjectURL(e.target.files[0]);
      // Обновляем отображаемый аватар сразу
      setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
    }
  };
  const uploadAvatar = async () => {
    if (!avatarFile) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Пожалуйста, авторизуйтесь для обновления аватара.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      // Здесь нужно вызвать функцию API для загрузки аватара
      // Например: const updatedProfile = await uploadUserAvatar(formData, token);
      // setProfile(updatedProfile); // Обновить профиль с новым avatar_url
      alert('Аватар загружен!');
    } catch (error: any) {
      alert(error.message || 'Ошибка загрузки аватара.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('Пожалуйста, войдите в систему');
    return;
  }

  const formData = new FormData();
  formData.append('name', profile.name || '');
  formData.append('email', profile.email || '');
  formData.append('description', profile.description || '');
  formData.append('privacy', profile.privacy || 'public');
  formData.append('social_facebook', profile.social_facebook || '');
  formData.append('social_twitter', profile.social_twitter || '');
  formData.append('social_instagram', profile.social_instagram || '');
  formData.append('is_influencer', profile.is_influencer ? 'true' : 'false');

  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }

  try {
    const updatedProfile = await updateUserProfile(formData, token);
    setProfile(updatedProfile);
    setIsEditing(false);
    alert('Профиль успешно обновлен!');
  } catch (error: any) {
    alert(error.response?.data?.detail || 'Ошибка при обновлении профиля');
  }
};



  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!profile) return null;

  return (
	  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
	    {isEditing ? (
	      <ProfileEditForm
	        profile={profile}
	        setProfile={setProfile}
	        avatarFile={avatarFile}
	        setAvatarFile={setAvatarFile}
	        handleAvatarChange={handleAvatarChange}
	        setIsEditing={setIsEditing}
	      />
	    ) : (
	      <>
	        {/* Cover Photo */}
	        <div className="h-48 bg-gradient-to-r from-purple-400 via-pink-400 to-teal-300 relative">
	          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
	        </div>

	        {/* Profile Info */}
	        <div className="relative px-8 pb-8">
	          {/* Avatar */}
	          <div className="relative -mt-16 mb-6">
	            <ProfileAvatar
	              profile={{ avatarUrl: profile.avatar_url, name: profile.name }}
	              getAvatarUrl={getAvatarUrl}
	              handleAvatarChange={handleAvatarChange}
	            />
	          </div>

	          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
	            {/* User Info */}
	            <div className="flex-1">
	              <div className="flex items-center gap-3 mb-2">
	                <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
	                <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-teal-400 text-white text-sm rounded-full font-medium">
	                  Участник.pro
	                </div>
	              </div>
	              <p className="text-gray-600 text-lg mb-4">
	                {profile.description || ' '}
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
	                  <a href={`mailto:${profile.email}`} className="text-purple-600 hover:text-purple-700 transition-colors">
	                    {profile.email}
	                  </a>
	                </div>
	              </div>
	            </div>

	            {/* Action Buttons */}
	            <div className="flex flex-col sm:flex-row gap-3">
	              <button
	                className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
	                onClick={() => setIsEditing(true)}
	              >
	                <Settings className="w-5 h-5" />
	              </button>
	            </div>
	          </div>

	          {/* Stats */}
	          <div className="flex flex-nowrap justify-center gap-6 mt-8 pt-6 border-t border-gray-100 overflow-x-auto">
	            <div className="text-center min-w-[70px] sm:min-w-[120px]">
	              <span className="text-sm sm:text-2xl font-bold text-purple-600">{ wishes.length }</span>
	              <div className="text-xs sm:text-sm text-gray-500">
	                {pluralize(wishes.length, 'желание', 'желания', 'желаний')}
	              </div>
	            </div>
	            <div className="text-center min-w-[70px] sm:min-w-[120px]">
	              <div className="text-sm sm:text-2xl font-bold text-teal-500">{ friends.length }</div>
	              <div className="text-xs sm:text-sm text-gray-500">
		              {pluralize(friends.length, 'друг', 'друга', 'друзей')}
	              </div>
	            </div>
	            <div className="text-center min-w-[70px] sm:min-w-[120px]">
	              <div className="text-sm sm:text-2xl font-bold text-orange-500">{ communities.length }</div>
	              <div className="text-xs sm:text-sm text-gray-500">
		              {pluralize(communities.length, 'сообщество', 'сообщества', 'сообществ')}
	              </div>
	            </div>
	          </div>
	        </div>
	      </>
	    )}
	  </div>
	);
};

export default ProfilePageHeader;