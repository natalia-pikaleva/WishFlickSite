import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-[#B48DFE] via-[#6A49C8] to-[#98E2D5] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 border border-white rounded-full animate-spin-slow"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border border-white rounded-full animate-spin-slow"></div>
          <div className="absolute top-1/2 left-1/3 w-16 h-16 border border-white rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-8">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
          Готовы ли воплотить свои мечты в реальность?
        </h2>
        
        <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
          Присоединяйтесь к тысячам мечтателей, которые уже воплотили свои желания в реальность.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-[#6A49C8] px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center group">
            Начните Свое Путешествие
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-[#6A49C8] transition-all duration-300">
            Узнай свои желания
          </button>
        </div>
        
        <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold">Бесплатно</div>
            <div className="text-purple-200 text-sm">Для начала</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">2%</div>
            <div className="text-purple-200 text-sm">Плата за платформу</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-purple-200 text-sm">Поддержка</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;