import React, { useState, useEffect, useRef  } from 'react';
import axios from 'axios';
import { Heart, Search, Bell, User, Menu, X } from 'lucide-react';
import { useAuthModal } from '../contexts/AuthModalContext';
{/*import FacebookLoginButton from './FacebookLoginButton';*/}
import logo from '../assets/logo.jpg';
import { API_BASE_URL, VK_CLIENT_ID, VK_REDIRECT_URI } from '../config';
import { Link, useNavigate } from 'react-router-dom';
import { generateCodeVerifier, generateCodeChallenge } from './utils/pkce';
import * as VKID from '@vkid/sdk';

const VkAuthWidget = ({ isAuthOpen }: { isAuthOpen: boolean }) => {
  const vkContainerRef = useRef<HTMLDivElement>(null);
  const [codeVerifier, setCodeVerifier] = useState<string>("");

  useEffect(() => {
    if (!isAuthOpen || !vkContainerRef.current) return;

    (async () => {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      setCodeVerifier(verifier);
      localStorage.setItem("vk_code_verifier", verifier);

      VKID.Config.set({
        app_id: VK_CLIENT_ID,
        redirect_uri: VK_REDIRECT_URI,
        code_challenge: challenge,
        code_challenge_method: "S256",
      });

      const oauthList = new VKID.OAuthList();

      oauthList.render({
        container: vkContainerRef.current,
        oauthList: [VKID.OAuthName.VK],
        scheme: VKID.Scheme.LIGHT,
        lang: VKID.Languages.RUS,
        styles: { height: 44, borderRadius: 8 },
      });

      oauthList.on(VKID.WidgetEvents.LOGIN_SUCCESS, (payload) => {
        const verifierFromStorage = localStorage.getItem("vk_code_verifier") || "";

        fetch("/api/auth/vk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: payload.code,
            device_id: payload.device_id,
            state: payload.state,
            code_verifier: verifierFromStorage,
          }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const errorText = await res.text();
              throw new Error(`Ошибка авторизации: ${errorText}`);
            }
            return res.json();
          })
          .then((data) => {
            localStorage.setItem("jwt_token", data.access_token);
            alert("Вы успешно вошли!");
            window.location.href = "/";
          })
          .catch((error) => {
            console.error("Ошибка при обмене кода на токен:", error);
            alert("Не удалось войти. Попробуйте снова.");
          });
      });

      return () => {
        oauthList.destroy();
      };
    })();
  }, [isAuthOpen]);

  return <div ref={vkContainerRef} style={{ minHeight: 44 }}></div>;
};

const Header = () => {
  const navigate = useNavigate();

  // Меню
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Авторизация из контекста
  const {
    isAuthOpen,
    authMode,
    openAuthModal,
    closeAuthModal,
    toggleAuthMode,
  } = useAuthModal();

  // Локальные состояния пользователя и формы
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAvatar, setUserAvatar] = useState('/default-avatar.png');
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    privacy: 'public' as 'public' | 'anonymous' | 'friends',
  });

  const [passwordError, setPasswordError] = useState("");
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [emailForVerify, setEmailForVerify] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [savedPassword, setSavedPassword] = useState('');


  const toggleAuthModeHandler = () => {
    toggleAuthMode();
    setFormData({
      email: '',
      password: '',
      name: '',
      privacy: 'public',
    });
  };

  const handleChange = (e) => {
	  const { name, value } = e.target;
	  setFormData((prev) => ({
	    ...prev,
	    [name]: value,
	  }));

      // Проверка совпадения паролей
	  if (name === "confirmPassword" || (name === "password" && formData.confirmPassword)) {
	    if (
	      name === "password"
	        ? value !== formData.confirmPassword
	        : value !== formData.password
	    ) {
	      setPasswordError("Пароли не совпадают");
	    } else {
	      setPasswordError("");
	    }
	  }
	};

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

  const handleSubmit = async (e) => {
	  e.preventDefault();
	  // Сброс ошибок перед запросом
	  setLoginError("");
	  setRegisterError("");
	  setPasswordError("");

	  if (authMode === "register" && formData.password !== formData.confirmPassword) {
	    setPasswordError("Пароли не совпадают");
	    return;
	  }

	  setIsLoading(true);
	  try {
	    let response;
	    if (authMode === "login") {
	      // Для логина отправляем form-data с username и password
	      const loginForm = new URLSearchParams();
	      loginForm.append("username", formData.email);
	      loginForm.append("password", formData.password);

	      response = await fetch("/api/auth/token", {
	        method: "POST",
	        headers: { "Content-Type": "application/x-www-form-urlencoded" },
	        body: loginForm,
	      });
	    } else {
	      // Для регистрации отправляем JSON
	      response = await fetch("/api/auth/register", {
	        method: "POST",
	        headers: { "Content-Type": "application/json" },
	        body: JSON.stringify({
	          email: formData.email,
	          password: formData.password,
	          name: formData.name,
	          privacy: formData.privacy
	        }),
	      });
	    }

	    if (!response.ok) {
	      const data = await response.json();
	      const errorMessage = data.detail || "Ошибка запроса";

	      // Устанавливаем ошибку в соответствующее состояние
	      if (authMode === "login") {
	        setLoginError(errorMessage);
	      } else {
	        setRegisterError(errorMessage);
	      }
	      return;
	    }

	    // Обработка успешного ответа
	    if (authMode === "register") {
	      setEmailForVerify(formData.email);
	      setSavedPassword(formData.password);
	      setStep("verify");
	    } else {
	      // Логика для успешного входа
	      const { access_token } = await response.json();
	      localStorage.setItem('access_token', access_token);
	      setIsLoggedIn(true);
	      closeAuthModal();
	      await fetchUserProfile(access_token);
	    }
	  } catch (err) {
	    const errorMessage = err.message || "Неизвестная ошибка";
	    if (authMode === "login") {
	      setLoginError(errorMessage);
	    } else {
	      setRegisterError(errorMessage);
	    }
	  } finally {
	    setIsLoading(false);
	  }
	};



  const handleVerify = async (e) => {
	  e.preventDefault();
	  setIsLoading(true);
	  setVerifyError('');
	  try {
	    const response = await fetch("/api/auth/verify-email", {
	      method: "POST",
	      headers: { "Content-Type": "application/json" },
	      body: JSON.stringify({
	        email: emailForVerify,
	        code: verificationCode,
	      }),
	    });
	    if (!response.ok) {
		  const data = await response.json();
		  throw new Error(data.detail || "Неверный код");
		}
		// Код верный — теперь логиним пользователя автоматически!
        await handleLoginAfterVerify();
		setEmailVerified(true);
		  } catch (err) {
		    setVerifyError(err.message);
		  } finally {
		    setIsLoading(false);
		  }
		};

	const handleLoginAfterVerify = async () => {
	  setIsLoading(true);
	  try {
	    const loginForm = new URLSearchParams();
			loginForm.append("username", emailForVerify);
			loginForm.append("password", savedPassword);

			const response = await fetch("/api/auth/token", {
			  method: "POST",
			  headers: { "Content-Type": "application/x-www-form-urlencoded" },
			  body: loginForm,
			});
	    if (!response.ok) {
	      throw new Error("Ошибка входа. Попробуйте вручную.");
	    }
	    const data = await response.json();
	    localStorage.setItem('access_token', data.access_token);
	    setIsLoggedIn(true);
	    closeAuthModal();
	    await fetchUserProfile(data.access_token);
	    // window.location.href = "/"  // если нужно редиректить на главную
	  } catch (err) {
	    alert(err.message);
	  }
	};

	const handleClose = () => {
	  closeAuthModal();
	  // Если нужно сбрасывать локальные состояния формы, добавь сброс здесь:
	  setFormData({
	    email: "",
	    password: "",
	    confirmPassword: "",
	    name: "",
	    privacy: "public",
	  });
	  setPasswordError("");
	  // и другие сбросы, если нужно
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
		    {/* Логотип */}
		    <Link to="/" className="flex items-center min-w-0 mr-4">
		      <img
		        src={logo}
		        alt="WishFlick Logo"
		        className="w-32 h-12 object-contain flex-shrink-0"
		      />
		    </Link>

		    {/* Навигация */}
		    <nav className="hidden md:flex items-center gap-6 flex-1">
		      <Link
		        to="/"
		        className="font-semibold text-base text-[#16141D] hover:text-[#835FE5] transition-colors"
		      >
		        Главная страница
		      </Link>
		      <Link
		        to="/wishlist"
		        className="font-semibold text-base text-[#1C1C1C] opacity-40 hover:opacity-100 hover:text-[#835FE5] transition"
		      >
		        Список желаний
		      </Link>
		      <Link
		        to="/campaigns"
		        className="font-semibold text-base text-[#1C1C1C] opacity-40 hover:opacity-100 hover:text-[#835FE5] transition"
		      >
		        Кампании
		      </Link>
		      <Link
		        to="/community"
		        className="font-semibold text-base text-[#1C1C1C] opacity-40 hover:opacity-100 hover:text-[#835FE5] transition"
		      >
		        Сообщество
		      </Link>
		      <Link
		        to="/influencer-wishlists"
		        className="font-semibold text-base text-[#1C1C1C] opacity-40 hover:opacity-100 hover:text-[#835FE5] transition"
		      >
		        Списки блогеров
		      </Link>
		    </nav>

		    {/* Поиск и иконки */}
		    <div className="flex items-center gap-2 min-w-0 ml-4">
		      <div className="hidden md:flex relative w-48">
		        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
		        <input
		          type="text"
		          placeholder="Поиск желаний..."
		          className="pl-10 pr-4 py-2 border border-gray-200 rounded-full w-full focus:ring-2 focus:ring-[#B48DFE] text-sm bg-white"
		        />
		      </div>
		      <button
		        className="p-2 text-gray-600 hover:text-[#835FE5] transition-colors"
		        aria-label="Notifications"
		      >
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
		            className="ml-2 px-4 py-1 rounded-full font-semibold text-white bg-gradient-to-r from-[#6A49C8] to-[#B48DFE] shadow-md hover:from-[#B48DFE] hover:to-[#6A49C8] transition-all duration-200 text-sm"
		          >
		            Logout
		          </button>
		        </>
		      ) : (
		        <button
		          className="px-4 py-2 bg-black/5 rounded-full font-bold text-[#16141D] opacity-60 hover:opacity-100 transition"
		          onClick={() => openAuthModal("login")}
		        >
		          Войти
		        </button>
		      )}
		      {/* Кнопка меню для мобильных */}
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
		  <div className="fixed inset-0 z-50 flex">
		    {/* Затемнение фона */}
		    <div
		      className="fixed inset-0 bg-black bg-opacity-40"
		      onClick={() => setIsMenuOpen(false)}
		      aria-hidden="true"
		    />
		    {/* Само меню */}
		    <div className="relative w-64 bg-white h-full shadow-lg flex flex-col p-6">
		      <button
		        className="absolute top-4 right-4 text-gray-600"
		        onClick={() => setIsMenuOpen(false)}
		        aria-label="Закрыть меню"
		      >
		        <X className="w-6 h-6" />
		      </button>
		      <nav className="mt-10 flex flex-col space-y-4">
		        <Link to="/" className="text-gray-700 hover:text-[#6A49C8] transition-colors" onClick={() => setIsMenuOpen(false)}>
		          Главная страница
		        </Link>
		        <Link to="/wishlist" className="text-gray-700 hover:text-[#6A49C8] transition-colors" onClick={() => setIsMenuOpen(false)}>
		          Список желаний
		        </Link>
		        <Link to="/campaigns" className="text-gray-700 hover:text-[#6A49C8] transition-colors" onClick={() => setIsMenuOpen(false)}>
		          Кампании
		        </Link>
		        <Link to="/community" className="text-gray-700 hover:text-[#6A49C8] transition-colors" onClick={() => setIsMenuOpen(false)}>
		          Сообщество
		        </Link>
		        <Link to="/influencer-wishlists" className="text-gray-700 hover:text-[#6A49C8] transition-colors" onClick={() => setIsMenuOpen(false)}>
		          Списки желаний блогеров
		        </Link>
		      </nav>
		    </div>
		  </div>
		)}

      </div>
    </header>

    {/* Модальное окно авторизации/регистрации */}
      {isAuthOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		  <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md mx-4 relative max-h-[80vh] overflow-y-auto">
		    <button
		      onClick={handleClose}
		      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
		      aria-label="Close form"
		    >
		      <X className="w-6 h-6" />
		    </button>

            {step === "register" ? (
              <>
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
                  {authMode === "login" ? "Авторизация" : "Регистрация"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                      Электронная почта
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
                      Пароль
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
                      placeholder="Твой пароль"
                    />
                  </div>

                  {authMode === "register" && (
                    <>
                      <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-1">
                          Повторите пароль
                        </label>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className={`w-full px-4 py-2 border ${
                            passwordError ? "border-red-500" : "border-gray-300"
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent`}
                          placeholder="Повторите пароль"
                        />
                        {passwordError && (
                          <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                          Имя
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
                          placeholder="Твое имя"
                        />
                      </div>
                      <div>
                        <label htmlFor="privacy" className="block text-gray-700 font-medium mb-1">
                          Вид аккаунта
                        </label>
                        <select
                          id="privacy"
                          name="privacy"
                          value={formData.privacy}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
                        >
                          <option value="public">Публичный</option>
                          <option value="anonymous">Анонимный</option>
                          <option value="friends">Только для друзей</option>
                        </select>
                      </div>
                    </>
                  )}


				  {(loginError || registerError) && (
				    <p className="text-red-500 text-sm mt-1">
				      {authMode === "login" ? loginError : registerError}
				    </p>
				  )}

				  <button
				    type="submit"
				    className="w-full py-3 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full font-semibold hover:shadow-lg transition-shadow duration-300"
				    disabled={
				      isLoading ||
				      (authMode === "register" && (!!passwordError || !formData.confirmPassword))
				    }
				  >
				    {isLoading
				      ? "..."
				      : authMode === "login"
				      ? "Войти"
				      : "Зарегистрироваться"}
				  </button>

                </form>
                <p className="mt-4 text-center text-gray-600">
                  {authMode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
                  <button
                    type="button"
                    onClick={toggleAuthModeHandler}
                    className="text-[#6A49C8] hover:text-[#B48DFE] font-semibold focus:outline-none"
                  >
                    {authMode === "login" ? "Регистрация" : "Войти"}
                  </button>
                </p>

                {/* Кнопки для OAuth и гостевого входа */}
                <div className="mt-6 text-center text-gray-600">Или продолжить</div>
                <div className="mt-4 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleFakeGoogleLogin}
                    className="w-full py-3 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full font-semibold hover:shadow-lg transition-shadow duration-300"
                  >
                    Продолжить с Google (Fake)
                  </button>

                  {/* Авторизация через ВКонтакте */}
			      <div ref={vkContainerRef} style={{ minHeight: 44 }}></div>

                  {/* <FacebookLoginButton /> */}
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full py-3 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full font-semibold hover:shadow-lg transition-shadow duration-300"
                  >
                    Войти как гость
                  </button>
                </div>
              </>
            ) : (
              <>
  {emailVerified ? (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-6 text-green-600">Электронная почта подтверждена!</h2>
      <p className="mb-4">Теперь вы можете войти на сайт.</p>
      <button
        className="py-3 px-6 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full font-semibold hover:shadow-lg transition-shadow duration-300"
        onClick={handleLoginAfterVerify}
      >
        Войти на сайт
      </button>
    </div>
  ) : (
    <>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
        Подтверждение email
      </h2>
      <div className="mb-4 text-center text-gray-700">
        На электронную почту{" "}
        <span className="font-semibold">{emailForVerify}</span> отправлен код.<br />
        Введите код из письма для завершения регистрации.
      </div>
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label htmlFor="verificationCode" className="block text-gray-700 font-medium mb-1">
            Код из письма
          </label>
          <input
            id="verificationCode"
            name="verificationCode"
            type="text"
            value={verificationCode}
            onChange={e => setVerificationCode(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
            placeholder="Введите код"
          />
          {verifyError && (
            <p className="text-red-500 text-sm mt-1">{verifyError}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full font-semibold hover:shadow-lg transition-shadow duration-300"
          disabled={isLoading || !verificationCode}
        >
          {isLoading ? "..." : "Подтвердить"}
        </button>
      </form>
    </>
  )}
</>

            )}
          </div>
        </div>
      )}
    </>
    );
};

export default Header;