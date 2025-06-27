import React from 'react';
import { Heart, Users, Clock } from 'lucide-react';

interface Campaign {
  id: number;
  title: string;
  organizer: string;
  image?: string;
  progress: number; // процент сбора средств
  raised: number;
  goal: number;
  supporters: number;
  timeLeft: string;
}

const sampleCampaigns: Campaign[] = [
  {
    id: 1,
    title: "Автоматизация умного дома",
    organizer: "Технические новаторы",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80",
    progress: 70,
    raised: 7000,
    goal: 10000,
    supporters: 150,
    timeLeft: "10 дней",
  },
  {
    id: 2,
    title: "Эко-френдли рюкзак",
    organizer: "Зеленая линия",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80",
    progress: 45,
    raised: 4500,
    goal: 10000,
    supporters: 85,
    timeLeft: "20 дней",
  },
  {
    id: 3,
    title: "Аппарат для обжарки кофе ручной работы",
    organizer: "Любители кофе",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80",
    progress: 80,
    raised: 8000,
    goal: 10000,
    supporters: 120,
    timeLeft: "5 дней",
  },
];

const Campaign = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] bg-clip-text text-transparent">
        Кампании
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sampleCampaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {campaign.image && (
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">{campaign.title}</h2>
              <p className="text-gray-600 mb-4">Создано: {campaign.organizer}</p>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-700 mb-1">
                  <span>Собрано: {campaign.raised} ₽</span>
                  <span>Цель: {campaign.goal} ₽</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${campaign.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="w-5 h-5" />
                  <span>{campaign.supporters} сторонников</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-5 h-5" />
                  <span>{campaign.timeLeft} осталось</span>
                </div>
              </div>

              <button
                type="button"
                className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full font-semibold hover:shadow-lg transition-shadow duration-300"
              >
                <Heart className="w-5 h-5" />
                Поддержать эту кампанию
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Campaign;
