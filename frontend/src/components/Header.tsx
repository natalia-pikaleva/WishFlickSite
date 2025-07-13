import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, X } from 'lucide-react';
import { useAuthModal } from '../contexts/AuthModalContext';
import { useNavigate } from 'react-router-dom';

import Logo from './Header_components/Logo';
import Navigation from './Header_components/Navigation';
import SearchBar from './Header_components/SearchBar';
import UserMenu from './Header_components/UserMenu';
import MobileMenu from './Header_components/MobileMenu';
import AuthModal from './Header_components/AuthModal';
import VkAuthWidget from './Header_components/VkAuthWidget';
import NotificationModal from './Header_components/NotificationModal';

import axios from 'axios';
import { API_BASE_URL } from '../config';

import {
  getUserProfile,
} from '../utils/api/userApi';
import { addFriend } from '../utils/api/friendsApi';

import {
	registerUser,
	loginUser,
	verifyEmail,
	guestLogin, } from '../utils/api/authApi'
import { getNotifications, markNotificationAsRead, Notification  } from '../utils/api/notificationsApi';


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    isAuthOpen,
    authMode,
    openAuthModal,
    closeAuthModal,
    toggleAuthMode,
  } = useAuthModal();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAvatar, setUserAvatar] = useState('/default-avatar.png');

  // Состояния формы и ошибок
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    privacy: 'public' as 'public' | 'anonymous' | 'friends',
  });
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Шаги регистрации/верификации
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [emailForVerify, setEmailForVerify] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [savedPassword, setSavedPassword] = useState('');

  const navigate = useNavigate();

  // Состояния для уведомлений
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);



  // Загрузка профиля пользователя по токену
  const fetchUserProfile = async (token: string) => {
  try {
    const user = await getUserProfile(token);
    setUserAvatar(user.avatar_url || '/default-avatar.png');
    localStorage.setItem('user_id', user.id.toString());
    localStorage.setItem('name', user.name.toString());
  } catch (error) {
    console.error('Failed to fetch user profile', error);
    handleLogout();
  }
};


  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      if (name === 'password' ? value !== formData.confirmPassword : value !== formData.password) {
        setPasswordError('Пароли не совпадают');
      } else {
        setPasswordError('');
      }
    }
  };

  // Обработчик отправки формы логина/регистрации
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
	  e.preventDefault();
	  setLoginError('');
	  setRegisterError('');
	  setPasswordError('');

	  if (authMode === 'register' && formData.password !== formData.confirmPassword) {
	    setPasswordError('Пароли не совпадают');
	    return;
	  }

	  setIsLoading(true);
	  try {
	    if (authMode === 'login') {
	      const data = await loginUser(formData.email, formData.password);
	      localStorage.setItem('access_token', data.access_token);
	      setIsLoggedIn(true);
	      closeAuthModal();
	      await fetchUserProfile(data.access_token);
	    } else {
	      await registerUser({
	        email: formData.email,
	        password: formData.password,
	        name: formData.name,
	        privacy: formData.privacy,
	      });
	      setEmailForVerify(formData.email);
	      setSavedPassword(formData.password);
	      setStep('verify');
	    }
	  } catch (err: any) {
	    const errorMessage = err.message || 'Неизвестная ошибка';
	    if (authMode === 'login') setLoginError(errorMessage);
	    else setRegisterError(errorMessage);
	  } finally {
	    setIsLoading(false);
	  }
	};


  // Обработка подтверждения email
  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
	  e.preventDefault();
	  setIsLoading(true);
	  setVerifyError('');
	  try {
	    await verifyEmail(emailForVerify, verificationCode);
	    await handleLoginAfterVerify();
	    setEmailVerified(true);
	  } catch (err: any) {
	    setVerifyError(err.message);
	  } finally {
	    setIsLoading(false);
	  }
	};


  // Автоматический вход после подтверждения email
  const handleLoginAfterVerify = async () => {
	  setIsLoading(true);
	  try {
	    const data = await loginUser(emailForVerify, savedPassword);
	    localStorage.setItem('access_token', data.access_token);
	    setIsLoggedIn(true);
	    closeAuthModal();
	    await fetchUserProfile(data.access_token);
	  } catch (err: any) {
	    alert(err.message);
	  } finally {
	    setIsLoading(false);
	  }
	};


  const handleClose = () => {
    closeAuthModal();
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      privacy: 'public',
    });
    setPasswordError('');
    setLoginError('');
    setRegisterError('');
    setStep('register');
    setEmailForVerify('');
    setVerificationCode('');
    setVerifyError('');
    setEmailVerified(false);
    setSavedPassword('');
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserAvatar('/default-avatar.png');
  };

  const handleGuestLogin = async () => {
	  try {
	    const data = await guestLogin();
	    localStorage.setItem('access_token', data.access_token);
	    setIsLoggedIn(true);
	    closeAuthModal();
	    await fetchUserProfile(data.access_token);
	  } catch {
	    alert('Failed to login as guest');
	  }
	};


  const handleFakeGoogleLogin = () => {
    localStorage.setItem('access_token', 'fake-google-token');
    setIsLoggedIn(true);
    closeAuthModal();
    navigate('/profile');
  };

  useEffect(() => {
	  const token = localStorage.getItem('access_token');
	  if (token) {
	    setIsLoggedIn(true);
	    fetchUserProfile(token);
	  }
	}, []);

  // Функция загрузки уведомлений
  const loadNotifications = async () => {
	  setLoadingNotifications(true);
	  try {
	    const data = await getNotifications(false); // true — получить только непрочитанные
	    setNotifications(data);
// 	    setUnreadCount(data.length);
	  } catch (error) {
	    console.error('Ошибка при загрузке уведомлений', error);
	  } finally {
	    setLoadingNotifications(false);
	  }
	};

  // Загрузить уведомления при открытии модалки
  const loadAllNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const [unread, read] = await Promise.all([
        getNotifications({ readFilter: false, limit: 50 }),
        getNotifications({ readFilter: true, limit: 50 }),
      ]);

      // Сортируем по дате внутри групп
      const sortedUnread = unread.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const sortedRead = read.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications([...sortedUnread, ...sortedRead]);
    } catch (error) {
      console.error('Ошибка при загрузке уведомлений', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleOpenNotifications = () => {
    setNotificationModalOpen(true);
    loadAllNotifications();
  };

  const handleCloseNotifications = async () => {
	  // Пометить непрочитанные уведомления как прочитанные
	  const unreadNotifications = notifications.filter(n => !n.is_read);
	  if (unreadNotifications.length > 0) {
	    try {
	      await Promise.all(unreadNotifications.map(n => markNotificationAsRead(n.id)));
	      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
	    } catch (error) {
	      console.error('Ошибка при пометке уведомлений как прочитанных', error);
	    }
	  }
	  setNotificationModalOpen(false);
	};


  // Вызов загрузки при монтировании и периодически (например, каждые 30 секунд)
  useEffect(() => {
	  if (isLoggedIn) {
	    loadNotifications();

	    const interval = setInterval(() => {
	      loadNotifications();
	    }, 30000); // 30 секунд

	    return () => clearInterval(interval);
	  }
	}, [isLoggedIn]);

  const onFriendRequestAccept = async (notification: Notification) => {

    console.log('onFriendRequestAccept notification:', notification);
    try {
      const friendId = notification.sender_id;
      if (!friendId) throw new Error('Некорректные данные уведомления');

      await addFriend(friendId);

      // Можно пометить уведомление как прочитанное или удалить из списка
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

      // Если нужно, можно вызвать API для пометки уведомления как прочитанного
      await markNotificationAsRead(notification.id);

      alert('Друг успешно добавлен!');
    } catch (error: any) {
      alert(error.message || 'Ошибка при добавлении друга');
    }
  };

  const onFriendRequestReject = async (notification: Notification) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
  };

  return (
    <>
      <header className="bg-white shadow sticky top-0 z-50 overflow-x-hidden">
		  <div className="flex justify-center bg-[#FAFAFC] py-4">
		    <div className="w-full max-w-[1208px] h-[86px] rounded-[47px] shadow flex items-center px-6 md:px-10 relative justify-between">

		      <div className="flex items-center gap-4">
		        <Logo />
		        <Navigation />
		      </div>

		      <div className="flex items-center gap-2 min-w-0 flex-nowrap ml-4">
				  <SearchBar className="hidden md:flex flex-grow min-w-0" />

				  {/* Колокольчик для десктопа */}
					<button
					  className="relative hidden md:block p-2 text-gray-600 hover:text-[#835FE5] transition-colors"
					  aria-label="Notifications"
					  onClick={handleOpenNotifications}
					>
					  <Bell className="w-5 h-5" />
					  {unreadCount > 0 && (
					    <span className="absolute top-0 right-0 inline-flex items-center justify-center
					      px-2 py-1 text-xs font-bold leading-none text-white bg-red-600
					      rounded-full transform translate-x-1/2 -translate-y-1/2
					    ">
					      {unreadCount}
					    </span>
					  )}
					</button>

					{/* Колокольчик для мобилки */}
					<button
					  className="relative md:hidden p-2 text-gray-600 hover:text-[#835FE5] transition-colors"
					  aria-label="Notifications"
					  onClick={handleOpenNotifications}					>
					  <Bell className="w-5 h-5" />
					  {unreadCount > 0 && (
					    <span className="absolute top-0 right-0 inline-flex items-center
					      justify-center px-2 py-1 text-xs font-bold leading-none
					      text-white bg-red-600 rounded-full transform
					      translate-x-1/2 -translate-y-1/2
					    ">
					      {unreadCount}
					    </span>
					  )}
					</button>


				  <UserMenu
				    className="hidden md:flex"
				    isLoggedIn={isLoggedIn}
				    userAvatar={userAvatar}
				    onLogout={handleLogout}
				    onLoginClick={() => openAuthModal('login')}
				  />
				  <button
				    className="md:hidden p-2 text-gray-600 flex-shrink-0"
				    onClick={() => setIsMenuOpen(!isMenuOpen)}
				    aria-label="Toggle menu"
				  >
				    {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
				  </button>
				</div>

		    </div>
		    <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
		  </div>
		</header>

	  <NotificationModal
		  open={isNotificationModalOpen}
		  notifications={notifications}
		  loading={loadingNotifications}
		  onClose={handleCloseNotifications}
		  onFriendRequestAccept={onFriendRequestAccept}
          onFriendRequestReject={onFriendRequestReject}
		  onNotificationClick={(notification) => {
		    // Можно также помечать отдельное уведомление прочитанным при клике
		    setNotificationModalOpen(false);
		  }}
		/>




      {isAuthOpen && (
        <AuthModal
          authMode={authMode}
          closeAuthModal={handleClose}
          toggleAuthMode={toggleAuthMode}
          formData={formData}
          setFormData={setFormData}
          passwordError={passwordError}
          setPasswordError={setPasswordError}
          loginError={loginError}
          registerError={registerError}
          isLoading={isLoading}
          step={step}
          setStep={setStep}
          emailForVerify={emailForVerify}
          setEmailForVerify={setEmailForVerify}
          verificationCode={verificationCode}
          setVerificationCode={setVerificationCode}
          verifyError={verifyError}
          setVerifyError={setVerifyError}
          emailVerified={emailVerified}
          setEmailVerified={setEmailVerified}
          savedPassword={savedPassword}
          setSavedPassword={setSavedPassword}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          handleVerify={handleVerify}
          handleLoginAfterVerify={handleLoginAfterVerify}
          handleFakeGoogleLogin={handleFakeGoogleLogin}
          handleGuestLogin={handleGuestLogin}
        />
      )}
    </>
  );
};

export default Header;
