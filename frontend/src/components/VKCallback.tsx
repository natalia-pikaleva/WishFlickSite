import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function VKCallback() {
  const navigate = useNavigate();
  const query = useQuery();

  useEffect(() => {
    const code = query.get("code");
    if (!code) {
      // Нет кода — редирект на страницу входа или ошибка
      navigate("/login");
      return;
    }

    // Отправляем код на бэкенд
    fetch(`${API_BASE_URL}/auth/vk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Ошибка авторизации");
        const data = await res.json();
        // Сохраняем токен
        localStorage.setItem("access_token", data.access_token);
        // Редирект на главную или нужную страницу
        navigate("/");
      })
      .catch(() => {
        alert("Не удалось войти через ВКонтакте");
        navigate("/login");
      });
  }, [query, navigate]);

  return <div>Авторизация через ВКонтакте...</div>;
}

export default VKCallback;
