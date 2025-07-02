import React, { useState } from 'react';
import { X } from 'lucide-react';
import VkAuthWidget from './VkAuthWidget';

interface AuthModalProps {
  authMode: 'login' | 'register';
  closeAuthModal: () => void;
  toggleAuthMode: () => void;

  // Состояния и обработчики, связанные с формой
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    privacy: 'public' | 'anonymous' | 'friends';
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    privacy: 'public' | 'anonymous' | 'friends';
  }>>;

  passwordError: string;
  setPasswordError: React.Dispatch<React.SetStateAction<string>>;

  loginError: string;
  registerError: string;

  isLoading: boolean;

  step: 'register' | 'verify';
  setStep: React.Dispatch<React.SetStateAction<'register' | 'verify'>>;

  emailForVerify: string;
  setEmailForVerify: React.Dispatch<React.SetStateAction<string>>;

  verificationCode: string;
  setVerificationCode: React.Dispatch<React.SetStateAction<string>>;

  verifyError: string;
  setVerifyError: React.Dispatch<React.SetStateAction<string>>;

  emailVerified: boolean;
  setEmailVerified: React.Dispatch<React.SetStateAction<boolean>>;

  savedPassword: string;
  setSavedPassword: React.Dispatch<React.SetStateAction<string>>;

  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleVerify: (e: React.FormEvent<HTMLFormElement>) => void;
  handleLoginAfterVerify: () => Promise<void>;
  handleFakeGoogleLogin: () => void;
  handleGuestLogin: () => void;
}

export default function AuthModal({
  authMode,
  closeAuthModal,
  toggleAuthMode,
  formData,
  setFormData,
  passwordError,
  setPasswordError,
  loginError,
  registerError,
  isLoading,
  step,
  setStep,
  emailForVerify,
  setEmailForVerify,
  verificationCode,
  setVerificationCode,
  verifyError,
  setVerifyError,
  emailVerified,
  setEmailVerified,
  savedPassword,
  setSavedPassword,
  handleChange,
  handleSubmit,
  handleVerify,
  handleLoginAfterVerify,
  handleFakeGoogleLogin,
  handleGuestLogin,
}: AuthModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md mx-4 relative max-h-[80vh] overflow-y-auto">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close form"
        >
          <X className="w-6 h-6" />
        </button>

        {step === 'register' ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
              {authMode === 'login' ? 'Авторизация' : 'Создайте аккаунт'}
            </h2>
            <h3 className="text-sm mb-6 text-center text-gray-900">
              Присоединяйтесь к сообществу мечтателей
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleFakeGoogleLogin}
				className="w-full py-3 bg-white text-black rounded-lg font-semibold border
				border-gray-300 hover:shadow-lg transition-shadow duration-300"
				>
                Продолжить с Google
              </button>

              {/* Виджет ВКонтакте
              <VkAuthWidget isAuthOpen={true} />*/}
              <button
                type="button"
                onClick={() => alert('Функция пока не реализована')}
				className="w-full py-3 bg-white text-black rounded-lg font-semibold border
				border-gray-300 hover:shadow-lg transition-shadow duration-300"
              >
                Продолжить с ВКонтакте
              </button>

              <button
                type="button"
                onClick={handleGuestLogin}
				className="w-full py-3 bg-white text-black rounded-lg font-semibold border
				border-gray-300 hover:shadow-lg transition-shadow duration-300"
              >
                Гостевой режим
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

              {authMode === 'register' && (
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
                        passwordError ? 'border-red-500' : 'border-gray-300'
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
                  {authMode === 'login' ? loginError : registerError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#B48DFE] to-[#98E2D5] text-white rounded-full font-semibold hover:shadow-lg transition-shadow duration-300"
                disabled={
                  isLoading ||
                  (authMode === 'register' && (!!passwordError || !formData.confirmPassword))
                }
              >
                {isLoading ? '...' : authMode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            </form>

            <p className="mt-4 text-center text-gray-600">
              {authMode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-[#6A49C8] hover:text-[#B48DFE] font-semibold focus:outline-none"
              >
                {authMode === 'login' ? 'Регистрация' : 'Войти'}
              </button>
            </p>

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
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Подтверждение email</h2>
                <div className="mb-4 text-center text-gray-700">
                  На электронную почту{' '}
                  <span className="font-semibold">{emailForVerify}</span> отправлен код.
                  <br />
                  Введите код из письма для завершения регистрации.
                </div>
                <form onSubmit={handleVerify} className="space-y-4" noValidate>
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
                    {verifyError && <p className="text-red-500 text-sm mt-1">{verifyError}</p>}
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full font-semibold hover:shadow-lg transition-shadow duration-300"
                    disabled={isLoading || !verificationCode}
                  >
                    {isLoading ? '...' : 'Подтвердить'}
                  </button>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
