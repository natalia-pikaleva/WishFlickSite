import React, { useState, useEffect, useRef  } from 'react';
import axios from 'axios';
import { VK_CLIENT_ID, VK_REDIRECT_URI } from '../../config';
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

      // Логируем значения перед отправкой в VKID.Config
	    console.log('VK_CLIENT_ID:', VK_CLIENT_ID);
	    console.log('VK_REDIRECT_URI:', VK_REDIRECT_URI);
	    console.log('code_challenge:', challenge);

      VKID.Config.set({
        app_id: 53840991,
        redirect_uri: "https://wishflick.ru/api/auth/vk/callback",
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

export default VkAuthWidget;
