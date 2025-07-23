import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav className="hidden md:flex items-center gap-6 flex-1">
      {/*<NavLink
        to="/"
        className={({ isActive }) =>
          isActive
            ? "font-bold text-base text-[#16141D] transition-colors"
            : "font-semibold text-base text-[#1C1C1C] opacity-40 hover:opacity-100 hover:text-[#835FE5] transition"
        }
      >
        Главная страница
      </NavLink>
      <NavLink
        to="/wishlist"
        className={({ isActive }) =>
          isActive
            ? "font-bold text-base text-[#16141D] transition-colors"
            : "font-semibold text-base text-[#1C1C1C] opacity-40 hover:opacity-100 hover:text-[#835FE5] transition"
        }
      >
        Список желаний
      </NavLink>
      <NavLink
        to="/campaigns"
        className={({ isActive }) =>
          isActive
            ? "font-bold text-base text-[#16141D] transition-colors"
            : "font-semibold text-base text-[#1C1C1C] opacity-40 hover:opacity-100 hover:text-[#835FE5] transition"
        }
      >
        Кампании
      </NavLink>*/}
      <NavLink
        to="/communities"
        className={({ isActive }) =>
          isActive
            ? "font-bold text-base text-[#16141D] transition-colors"
            : "font-semibold text-base text-[#1C1C1C] opacity-40 hover:opacity-100 hover:text-[#835FE5] transition"
        }
      >
        Поиск сообществ
      </NavLink>
      <NavLink
        to="/users"
        className={({ isActive }) =>
          isActive
            ? "font-bold text-base text-[#16141D] transition-colors"
            : "font-semibold text-base text-[#1C1C1C] opacity-40 hover:opacity-100 hover:text-[#835FE5] transition"
        }
      >
        Поиск друзей
      </NavLink>
    </nav>
  );
}
