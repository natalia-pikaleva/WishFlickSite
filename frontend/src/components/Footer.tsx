import React from 'react';
import { Heart, Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    product: [
      { name: 'Особенности', href: '#' },
      { name: 'Как это работает', href: '#' },
      { name: 'Ценообразование', href: '#' },
      { name: 'API', href: '#' }
    ],
    community: [
      { name: 'Узнай свои желания', href: '#' },
      { name: 'Истории успеха', href: '#' },
      { name: 'Гильдии сообществ', href: '#' },
      { name: 'Блог', href: '#' }
    ],
    support: [
      { name: 'Центр поддержки', href: '#' },
      { name: 'Контакты', href: '#' },
      { name: 'Доверие и безопасность', href: '#' },
      { name: 'Статус', href: '#' }
    ],
    company: [
      { name: 'О нас', href: '#' },
      { name: 'Вакансии', href: '#' },
      { name: 'Пресслужба', href: '#' },
      { name: 'Инвесторы', href: '#' }
    ]
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-6 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
			  <div className="w-8 h-8 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] rounded-lg flex items-center justify-center">
			    <Heart className="w-5 h-5" fill="#98E2D5" />
			  </div>
			  <span className="text-xl font-bold bg-gradient-to-r from-[#B48DFE] to-[#98E2D5] bg-clip-text text-transparent">
			    WishFlick
			  </span>
			</div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Платформа, где мечты сбываются благодаря поддержке сообщества,
			  социальным связям и совместному финансированию.
            </p>
            
            {/* Newsletter */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Будьте в курсе событий</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Введи адрес электронной почты"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] rounded-r-lg hover:shadow-lg transition-all duration-300">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-white mb-4">Продукт</h4>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-400 hover:text-[#B48DFE] transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Сообщество</h4>
              <ul className="space-y-2">
                {footerLinks.community.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-400 hover:text-[#B48DFE] transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Поддержка</h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-400 hover:text-[#B48DFE] transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Компания</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-400 hover:text-[#B48DFE] transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2025 WishFlick. Все права защищены.
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <a href="#" className="text-gray-400 hover:text-[#B48DFE] transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#B48DFE] transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#B48DFE] transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-[#B48DFE] transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;