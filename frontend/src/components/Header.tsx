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

import axios from 'axios';
import { API_BASE_URL } from '../config';

import {
  getUserProfile,
} from '../utils/api/userApi';

import {
	registerUser,
	loginUser,
	verifyEmail,
	guestLogin, } from '../utils/api/authApi'

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

  // Загрузка профиля пользователя по токену
  const fetchUserProfile = async (token: string) => {
  try {
    const user = await getUserProfile(token);
    setUserAvatar(user.avatar_url || '/default-avatar.png');
    localStorage.setItem('user_id', user.id.toString());
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
    localStorage.removeItem('access_token');
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
		        <button
				  className="hidden md:block p-2 text-gray-600 hover:text-[#835FE5] transition-colors"
				  aria-label="Notifications"
				>
				  <Bell className="w-5 h-5" />
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
