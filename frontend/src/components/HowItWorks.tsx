import React from 'react';
import { PlusCircle, Users, Gift, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: PlusCircle,
      title: "Создай свой список желаний",
      description: "Добавляй предметы, о которых мечтаешь, от гаджетов до впечатлений",
      color: "bg-[#B48DFE]"
    },
    {
      icon: Users,
      title: "Поделись с сообществом",
      description: "Общайся с друзьями и находи сторонников, которые верят в твои мечты",
      color: "bg-[#6A49C8]"
    },
    {
      icon: Gift,
      title: "Получи поддержку",
      description: "Наблюдай, как твое сообщество помогает тебе достичь твоих целей с помощью пожертвований",
      color: "bg-[#98E2D5]"
    },
    {
      icon: CheckCircle,
      title: "Осуществи с мечты",
      description: "Отпразднуй достижение своей цели и вдохновляй других делать то же самое",
      color: "bg-[#B48DFE]"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Как WishFlick работает
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Четыре простых шага, которые помогут воплотить ваши желания в реальность с помощью сообщества
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-8">
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent transform translate-x-8">
                    <div className="absolute right-0 top-1/2 w-2 h-2 bg-gray-300 rounded-full transform -translate-y-1/2"></div>
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;