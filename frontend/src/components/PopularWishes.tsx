import React from 'react';
import { Heart, Users, Clock, TrendingUp } from 'lucide-react';

const PopularWishes = () => {
  const wishes = [
    {
      id: 1,
      title: "Профессиональное фотооборудование",
      user: "Александр Петров",
      image: "https://avatars.mds.yandex.net/i?id=32c8eedfa630b66c7c0e72c5838568ebef91b54f-5292126-images-thumbs&n=13&auto=compress&cs=tinysrgb&w=400",
      progress: 75,
      raised: 1875,
      goal: 2500,
      supporters: 23,
      category: "Творчество",
      timeLeft: "12 дней"
    },
    {
      id: 2,
      title: "Обучение в учебном лагере по программированию",
      user: "Мария Михайлова",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=compress&cs=tinysrgb&w=400",
      progress: 45,
      raised: 1350,
      goal: 3000,
      supporters: 31,
      category: "Обучение",
      timeLeft: "25 дней"
    },
    {
      id: 3,
      title: "Приключение на горном велосипеде",
      user: "Даниил Спиридонов",
      image: "https://avatars.mds.yandex.net/i?id=fabfac3add6c11c9b96161abf5627f9f1195ec10-8263377-images-thumbs&n=13&auto=compress&cs=tinysrgb&w=400",
      progress: 88,
      raised: 1320,
      goal: 1500,
      supporters: 18,
      category: "Путешествие",
      timeLeft: "8 дней"
    },
    {
      id: 4,
      title: "Открыть свою мастерскую",
      user: "Ксения Соколова",
      image: "https://avatars.mds.yandex.net/i?id=ad6c1e1c73ac27ee9a63a5baf441433565cfafcf-3702367-images-thumbs&n=13&auto=compress&cs=tinysrgb&w=400",
      progress: 62,
      raised: 930,
      goal: 1500,
      supporters: 27,
      category: "Творчество",
      timeLeft: "18 дней"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Желания в тренде
            </h2>
            <p className="text-xl text-gray-600">
              Узнай, что сообщество поддерживает прямо сейчас
            </p>
          </div>
          
          <button className="hidden sm:flex items-center text-[#6A49C8] font-semibold hover:text-[#B48DFE] transition-colors">
            Посмотреть все
            <TrendingUp className="ml-2 w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishes.map((wish) => (
            <div key={wish.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="relative">
                <img 
                  src={wish.image} 
                  alt={wish.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#B48DFE] text-white px-3 py-1 rounded-full text-sm font-medium">
                    {wish.category}
                  </span>
                </div>
                <button className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {wish.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4"> {wish.user}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Прогресс</span>
                    <span className="font-semibold">{wish.raised} ₽ / {wish.goal} ₽</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${wish.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{wish.supporters} сторонников</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{wish.timeLeft}</span>
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300">
                  Поддержать это желание
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularWishes;