import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Получаем параметр token из URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Сохраняем токен в localStorage
      localStorage.setItem('access_token', token);
      // Перенаправляем пользователя на нужную страницу, например, профиль
      navigate('/profile');
    } else {
      // Если токен отсутствует, можно перенаправить на страницу логина
      navigate('/login');
    }
  }, [navigate]);

  return <div>Loading...</div>;
};

export default OAuthCallback;
