import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black bg-opacity-40" onClick={onClose} aria-hidden="true" />
      <div className="relative w-64 bg-white h-full shadow-lg flex flex-col p-6">
        <button className="absolute top-4 right-4 text-gray-600" onClick={onClose} aria-label="Закрыть меню">
          <X className="w-6 h-6" />
        </button>
        <nav className="mt-10 flex flex-col space-y-4">
          <Link to="/" className="text-gray-700 hover:text-[#6A49C8] transition-colors" onClick={onClose}>
            Главная страница
          </Link>
          <Link to="/communities" className="text-gray-700 hover:text-[#6A49C8] transition-colors" onClick={onClose}>
            Поиск сообществ
          </Link>
          <Link to="/users" className="text-gray-700 hover:text-[#6A49C8] transition-colors" onClick={onClose}>
            Поиск друзей
          </Link>

          {/* Горизонтальная тонкая линия */}
          <hr className="border-t border-gray-300 my-4" />

		  {/* Профиль */}
		  <Link to="/profile" className="text-gray-700 hover:text-[#6A49C8] transition-colors" onClick={onClose}>
		    Мой профиль
		  </Link>
        </nav>
      </div>
    </div>
  );
}
