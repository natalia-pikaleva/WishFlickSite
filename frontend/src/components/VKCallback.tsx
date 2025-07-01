import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from '../config';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function VKCallback() {
  const navigate = useNavigate();
  const query = useQuery();

  useEffect(() => {
    const queryState = query.get('state');
    const savedState = sessionStorage.getItem('state');
    const code = query.get('code');

    // Проверка наличия кода и совпадения state для защиты от CSRF
    if (!code || queryState !== savedState) {
      alert("Ошибка безопасности или отсутствует код авторизации.");
      navigate('/');
      return;
    }

    const codeVerifier = sessionStorage.getItem('code_verifier');
    if (!codeVerifier) {
      alert("Отсутствует code_verifier. Попробуйте авторизоваться снова.");
      navigate('/');
      return;
    }

    // Отправляем код и code_verifier на сервер для обмена на токен
    fetch(`${API_BASE_URL}/auth/vk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier: codeVerifier }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Ошибка авторизации");
        }
        return res.json();
      })
      .then((data) => {
        // Сохраняем полученный JWT токен
        localStorage.setItem('access_token', data.access_token);
        // Очищаем временные данные PKCE из sessionStorage
        sessionStorage.removeItem('code_verifier');
        sessionStorage.removeItem('state');
        // Перенаправляем пользователя на главную или нужную страницу
        navigate('/');
      })
      .catch((error) => {
        alert(`Не удалось войти через ВКонтакте: ${error.message}`);
        navigate('/');
      });
  }, [query, navigate]);

  return <div>Авторизация через ВКонтакте...</div>;
}

export default VKCallback;
