import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function VKCallback() {
  const navigate = useNavigate();
  const query = useQuery();

  useEffect(() => {
    const token = query.get("token");
    if (!token) {
      // Нет токена — редирект на страницу входа или ошибка
      navigate("/");
      return;
    }

    // Сохраняем токен
    localStorage.setItem("access_token", token);

    // Редирект на главную или нужную страницу
    navigate("/");
  }, [query, navigate]);

  return <div>Авторизация через ВКонтакте...</div>;
}

export default VKCallback;
