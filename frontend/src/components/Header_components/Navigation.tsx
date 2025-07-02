import React from 'react';
import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav className="hidden md:flex items-center gap-6 flex-1">
      <Link to="/" className="font-semibold text-base text-[#16141D] hover:text-[#835FE5] transition-colors">Главная страница</Link>
      <Link to="/wishlist" className="font-semibold text-base text-[#1C1C1C] opacity-40 hover:opacity-100 hover:text-[#835FE5] transition">Список желаний</Link>
      <Link to="/campaigns" className="font-semibold text-base text-[#1C1C1C] opacity-40 hover:opacity-100 hover:text-[#835FE5] transition">Кампании</Link>
      <Link to="/community" className="font-semibold text-base text-[#1C1C1C] opacity-40 hover:opacity-100 hover:text-[#835FE5] transition">Сообщество</Link>
      <Link to="/influencer-wishlists" className="font-semibold text-base text-[#1C1C1C] opacity-40 hover:opacity-100 hover:text-[#835FE5] transition">Списки блогеров</Link>
    </nav>
  );
}
