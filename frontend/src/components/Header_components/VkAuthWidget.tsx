import React, { useEffect, useRef } from 'react';
import * as VKID from '@vkid/sdk';

interface VkAuthWidgetProps {
  isAuthOpen: boolean;
}

const VkAuthWidget = ({ isAuthOpen }: VkAuthWidgetProps) => {
  const vkContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthOpen || !vkContainerRef.current) return;

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
  }, [isAuthOpen]);

  return <div ref={vkContainerRef} style={{ minHeight: 44 }}></div>;
};

export default VkAuthWidget;

