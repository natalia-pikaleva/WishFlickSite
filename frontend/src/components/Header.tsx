import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Heart, Search, Bell, User, Menu, X } from 'lucide-react';
{/*import FacebookLoginButton from './FacebookLoginButton';*/}
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';

import { API_BASE_URL } from '../config';

const Header = () => {
  const navigate = useNavigate();

  // Состояния меню и модального окна авторизации
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Состояния авторизации пользователя
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAvatar, setUserAvatar] = useState('/default-avatar.png');

  // Режим формы: вход или регистрация
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Данные формы
  const [formData, setFormData] = useState({
	  email: '',
	  password: '',
	  name: '',
	  privacy: 'public' as 'public' | 'anonymous' | 'friends',
	});

  // Переключение между входом и регистрацией
  const toggleAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
	setFormData({
	  email: '',
	  password: '',
	  name: '',
	  privacy: 'public',
	});
  };

  // Обработка изменений в форме
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
	  setFormData({ ...formData, [e.target.name]: e.target.value });
	};

  // Получение профиля пользователя по токену
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data;
      setUserAvatar(user.avatar_url || '/default-avatar.png');
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      handleLogout();
    }
  };

  // Проверка токена при загрузке компонента
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile(token);
    }
  }, []);

  // Обработка отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (authMode === 'login') {
        // Логин: POST /token с form-data
        const params = new URLSearchParams();
        params.append('username', formData.email);
        params.append('password', formData.password);

        const response = await axios.post(`${API_BASE_URL}/token`, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const { access_token } = response.data;
        localStorage.setItem('access_token', access_token);
        setIsLoggedIn(true);
        setIsAuthOpen(false);
        await fetchUserProfile(access_token);
      } else {
        // Регистрация: POST /register с JSON
        await axios.post(`${API_BASE_URL}/register`, {
		  email: formData.email,
		  password: formData.password,
		  name: formData.name,
		  privacy: formData.privacy,
		});

        setAuthMode('login');
        alert('Registration successful! Please log in.');
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error occurred');
    }
  };

  // Выход
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    setUserAvatar('/default-avatar.png');
  };

  const handleGuestLogin = async () => {
	  try {
	    const response = await axios.post(`${API_BASE_URL}/guest-register`);
	    const { access_token } = response.data;
	    localStorage.setItem('access_token', access_token);
	    setIsLoggedIn(true);
	    setIsAuthOpen(false);
	    await fetchUserProfile(access_token);
	  } catch (error) {
	    alert('Failed to login as guest');
	  }
	};

  const handleFakeGoogleLogin = () => {
    localStorage.setItem('access_token', 'fake-google-token');
    setIsLoggedIn(true);
    setIsAuthOpen(false);
    // Переход на страницу профиля
    navigate('/profile');
  };


return (
  <>
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Логотип */}
          <div className="flex items-center space-x-2">
			  <img
			    src={logo}
			    alt="WishFlick Logo"
			    className="w-full max-w-[200px] h-16 object-contain"
			  />
			  <span className="text-xl font-bold bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] bg-clip-text text-transparent">
			  </span>
			</div>



          {/* Навигация для десктопа */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-[#6A49C8] transition-colors">
              Explore
            </Link>
            <Link to="/wishlist" className="text-gray-700 hover:text-[#6A49C8] transition-colors">
              Wishlist
            </Link>
            <Link to="/campaigns" className="text-gray-700 hover:text-[#6A49C8] transition-colors">
              Campaigns
            </Link>
            <Link to="/community" className="text-gray-700 hover:text-[#6A49C8] transition-colors">
              Community
            </Link>
          </nav>

          {/* Поиск и иконки */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search wishes..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
              />
            </div>

            <button className="p-2 text-gray-600 hover:text-[#6A49C8] transition-colors" aria-label="Notifications">
              <Bell className="w-5 h-5" />
            </button>

            {isLoggedIn ? (
              <>
                <Link to="/profile" aria-label="Go to profile">
                  <img
                    src={userAvatar}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#B48DFE]"
                  />
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-1 rounded-full font-semibold text-white bg-gradient-to-r from-[#6A49C8] to-[#B48DFE] shadow-md hover:from-[#B48DFE] hover:to-[#6A49C8] transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                className="p-2 text-gray-600 hover:text-[#6A49C8] transition-colors"
                onClick={() => setIsAuthOpen(true)}
                aria-label="Open login/register form"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-[#6A49C8] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                to="/wishlist"
                className="text-gray-700 hover:text-[#6A49C8] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Wishlist
              </Link>
              <Link
                to="/campaigns"
                className="text-gray-700 hover:text-[#6A49C8] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Campaigns
              </Link>
              <Link
                to="/community"
                className="text-gray-700 hover:text-[#6A49C8] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Community
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>

    {/* Модальное окно авторизации/регистрации */}
    {isAuthOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md mx-4 relative">
          <button
            onClick={() => setIsAuthOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            aria-label="Close form"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
            {authMode === 'login' ? 'Login' : 'Register'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
                placeholder="Your password"
              />
            </div>
            {authMode === 'register' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="privacy" className="block text-gray-700 font-medium mb-1">
                    Privacy
                  </label>
                  <select
                    id="privacy"
                    name="privacy"
                    value={formData.privacy}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
                  >
                    <option value="public">Public</option>
                    <option value="anonymous">Anonymous</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full font-semibold hover:shadow-lg transition-shadow duration-300"
            >
              {authMode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
          <p className="mt-4 text-center text-gray-600">
            {authMode === 'login' ? 'No account?' : 'Already have an account?'}{' '}
            <button
              onClick={toggleAuthMode}
              className="text-[#6A49C8] hover:text-[#B48DFE] font-semibold focus:outline-none"
            >
              {authMode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>

          {/* Кнопки для OAuth и гостевого входа */}
          <div className="mt-6 text-center text-gray-600">Or continue with</div>

          <div className="mt-4 flex justify-center space-x-4">

{/*
			<button
              type="button"
              onClick={() => window.location.href = `${API_BASE_URL}/auth/google`}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Continue with Google
            </button>
            */}
			<button
		      type="button"
		      onClick={handleFakeGoogleLogin}
		      className="w-full py-3 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full font-semibold hover:shadow-lg transition-shadow duration-300"
		    >
		      Continue with Google (Fake)
		    </button>
            {/* Вместо кнопки Facebook вставляем компонент */}
		 {/*} <FacebookLoginButton /> */}

		  {/* Кнопка гостевого входа, если нужна */}
		  {/* <button
		    type="button"
		    onClick={handleGuestLogin}
		    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
		  >
		    Continue as Guest
		  </button> */}
		</div>
        </div>
      </div>
    )}
  </>
);
};
export default Header;
