import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Play, Users, Heart } from 'lucide-react';
import { useAuthModal } from '../contexts/AuthModalContext';
import { useNavigate } from 'react-router-dom';

function useAnimatedNumber(to: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.floor(progress * to));
      if (progress < 1) requestAnimationFrame(animate);
      else setValue(to);
    }
    requestAnimationFrame(animate);
    // eslint-disable-next-line
  }, [to]);
  return value;
}

const Hero: React.FC = () => {
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();

  const isLoggedIn = Boolean(localStorage.getItem('access_token'));
  const wishesCount = useAnimatedNumber(10000);
  const usersCount = useAnimatedNumber(50000);
  const totalSum = useAnimatedNumber(2000000);

  const activities = [
	  { user: "Александр", text: 'поддержал твое желание', comment: 'Надеюсь, ты получишь эту камеру! 📸' },
	  { user: "Мария", text: 'отправила тебе подарок', comment: 'Пусть мечта сбудется!' },
	  { user: "Иван", text: 'добавил тебя в друзья', comment: 'Вместе веселее!' },
		];

  const [activityIndex, setActivityIndex] = useState(0);
	useEffect(() => {
	  const id = setInterval(() => setActivityIndex(i => (i + 1) % activities.length), 3500);
	  return () => clearInterval(id);
	}, []);
	const activity = activities[activityIndex];

  const handleGetStartedClick = () => {
    if (isLoggedIn) {
      navigate('/wishlist');
    } else {
      openAuthModal('login');
    }
  };

  return (
	<section className="relative overflow-hidden bg-gradient-to-br from-[#B48DFE] via-[#6A49C8] to-[#98E2D5] text-white">
	 {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 border-2 border-white rounded-full animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                ПРЕВРАТИ СВОИ
                <br />
                <span className="text-[#98E2D5]">МЕЧТЫ</span>
                <br />
                В РЕАЛЬНОСТЬ
              </h1>
              <p className="text-lg sm:text-xl text-purple-100 leading-relaxed">
                Присоединяйтесь к сообществу, где желания сбываются благодаря социальному финансированию,
				общим мечтам и коллективной поддержке.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
		        <button
		          className="bg-white text-[#6A49C8] px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center group"
		          onClick={handleGetStartedClick} >
		          Начать
		          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
		        </button>

              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-[#6A49C8] transition-all duration-300 flex items-center justify-center group">
                <Play className="mr-2 w-5 h-5" />
                Посмотреть демо
              </button>
            </div>


            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
			  <div className="text-center">
			    <div className="text-xl sm:text-2xl font-bold">{wishesCount.toLocaleString()}+</div>
			    <div className="text-purple-200 text-xs sm:text-sm">Сбывшихся Желаний</div>
			  </div>
			  <div className="text-center">
			    <div className="text-xl sm:text-2xl font-bold">{usersCount.toLocaleString()}+</div>
			    <div className="text-purple-200 text-xs sm:text-sm">Активных Пользователей</div>
			  </div>
			  <div className="text-center">
			    <div className="text-xl sm:text-2xl font-bold">
			      {totalSum.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })}
			      +
			    </div>
			    <div className="text-purple-200 text-xs sm:text-sm">Выросли Вместе</div>
			  </div>
			</div>

          </div>

          {/* Visual */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="space-y-6">
                {/* Mock Wishlist Item */}
                <div className="bg-white/15 rounded-2xl p-6 backdrop-blur-sm transform transition-transform hover:scale-105">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-[#98E2D5] rounded-full flex items-center justify-center animate-bounce">
					  <Heart className="w-6 h-6 text-white" />
					</div>

                    <div>
                      <div className="font-semibold">Отпуск мечты</div>
                      <div className="text-sm text-purple-200">от Анны М.</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Прогресс</span>
                      <span>140.000 ₽ / 300.000 ₽</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-[#98E2D5] h-2 rounded-full w-[48%]"></div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-4 h-4" />
                      <span>23 человека поддержало</span>
                    </div>
                  </div>
                </div>

                {/* Mock Social Activity */}
                <div className="bg-white/15 rounded-2xl p-6 backdrop-blur-sm transition-all duration-500">
				  <div className="flex items-center space-x-3 mb-3">
				    <div className="w-8 h-8 bg-[#B48DFE] rounded-full"></div>
				    <div className="text-sm">
				      <span className="font-semibold">{activity.user}</span> {activity.text}
				    </div>
				  </div>
				  <div className="text-sm text-purple-200">{activity.comment}</div>
				</div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;