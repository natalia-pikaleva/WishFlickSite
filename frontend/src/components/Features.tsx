import React from 'react';
import { Heart, Users, Target, Share2, Zap, Shield } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Heart,
      title: "Создание желаний",
      description: "Создавай и упорядочивай свои мечты с помощью красивых списков желаний, которыми можно поделиться",
      color: "from-[#B48DFE] to-[#6A49C8]"
    },
    {
      icon: Users,
      title: "Социальное финансирование",
      description: "Получи поддержку от друзей, семьи и сообщества для достижения своих целей",
      color: "from-[#6A49C8] to-[#98E2D5]"
    },
    {
      icon: Target,
      title: "Трекер цели",
      description: "Следи за прогрессом с помощью подробной аналитики и отмечай важные события",
      color: "from-[#98E2D5] to-[#B48DFE]"
    },
    {
      icon: Share2,
      title: "Социальная сеть",
      description: "Общайся с мечтателями-единомышленниками",
      color: "from-[#B48DFE] to-[#98E2D5]"
    },
    {
      icon: Zap,
      title: "AI рекомендации",
      description: "Получай персонализированные предложения, основанные на твоих интересах и целях",
      color: "from-[#6A49C8] to-[#B48DFE]"
    },
    {
      icon: Shield,
      title: "Безопасные платежи",
      description: "Безопасные и зашифрованные транзакции с гарантией возврата средств",
      color: "from-[#98E2D5] to-[#6A49C8]"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Все, что нужно для воплощения мечты в реальность
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            WishFlick сочетает в себе лучшее из социальных сетей, краудфандинга и управления списками
			желаний в одной мощной платформе.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;