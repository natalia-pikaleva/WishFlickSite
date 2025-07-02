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
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data;
      setUserAvatar(user.avatar_url || '/default-avatar.png');
      localStorage.setItem('user_id', user.id.toString());
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      handleLogout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile(token);
    }
  }, []);

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
      let response: Response;
      if (authMode === 'login') {
        const loginForm = new URLSearchParams();
        loginForm.append('username', formData.email);
        loginForm.append('password', formData.password);

        response = await fetch('/api/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: loginForm,
        });
      } else {
        response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            privacy: formData.privacy,
          }),
        });
      }

      if (!response.ok) {
        const data = await response.json();
        const errorMessage = data.detail || 'Ошибка запроса';
        if (authMode === 'login') setLoginError(errorMessage);
        else setRegisterError(errorMessage);
        return;
      }

      if (authMode === 'register') {
        setEmailForVerify(formData.email);
        setSavedPassword(formData.password);
        setStep('verify');
      } else {
        const { access_token } = await response.json();
        localStorage.setItem('access_token', access_token);
        setIsLoggedIn(true);
        closeAuthModal();
        await fetchUserProfile(access_token);
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
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForVerify, code: verificationCode }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Неверный код');
      }
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
      const loginForm = new URLSearchParams();
      loginForm.append('username', emailForVerify);
      loginForm.append('password', savedPassword);

      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: loginForm,
      });
      if (!response.ok) throw new Error('Ошибка входа. Попробуйте вручную.');

      const data = await response.json();
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
      const response = await axios.post(`${API_BASE_URL}/auth/guest-register`);
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      setIsLoggedIn(true);
      closeAuthModal();
      await fetchUserProfile(access_token);
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

  return (
    <>
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="w-full flex justify-center bg-[#FAFAFC] py-4">
          <div className="w-full max-w-[1208px] h-[86px] rounded-[47px] shadow-[0_10px_40px_-10px_rgba(40,72,95,0.1)] flex items-center px-6 md:px-10 relative">
            <Logo />
            <Navigation />
            <div className="flex items-center gap-2 min-w-0 ml-4">
              <SearchBar />
              <button className="p-2 text-gray-600 hover:text-[#835FE5] transition-colors" aria-label="Notifications">
                <Bell className="w-5 h-5" />
              </button>
              <UserMenu
                isLoggedIn={isLoggedIn}
                userAvatar={userAvatar}
                onLogout={handleLogout}
                onLoginClick={() => openAuthModal('login')}
              />
              <button
                className="md:hidden p-2 text-gray-600"
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
