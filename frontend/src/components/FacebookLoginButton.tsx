import FacebookLogin from '@greatsumini/react-facebook-login';

const FacebookLoginButton = () => {
  const handleSuccess = async (response: any) => {
    console.log('Login Success!', response);
    const accessToken = response.accessToken;

    // Отправляем accessToken на бэкенд для проверки и регистрации/логина пользователя
    try {
      const res = await fetch('http://localhost:8000/auth/facebook/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: accessToken }),
      });
      const data = await res.json();

      if (res.ok) {
        // Сохраняем JWT токен, полученный от сервера
        localStorage.setItem('access_token', data.access_token);
        // Например, обновляем состояние и переходим на профиль
        // setIsLoggedIn(true);
        // navigate('/profile');
      } else {
        alert(data.detail || 'Facebook login failed on server');
      }
    } catch (error) {
      console.error('Error during Facebook login:', error);
    }
  };

  const handleFail = (error: any) => {
    console.error('Login Failed!', error);
  };

  return (
    <FacebookLogin
      appId="ВАШ_FACEBOOK_APP_ID"
      onSuccess={handleSuccess}
      onFail={handleFail}
      fields="name,email,picture"
      scope="email,public_profile"
      render={({ onClick }) => (
        <button
          type="button"
          onClick={onClick}
          className="w-full py-3 bg-gradient-to-r from-[#4267B2] to-[#365899] text-white rounded-full font-semibold hover:shadow-lg transition-shadow duration-300 flex items-center justify-center space-x-2"
        >
          <span>Continue with Facebook</span>
        </button>
      )}
    />
  );
};

export default FacebookLoginButton;