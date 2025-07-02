import React from 'react';
import { Link } from 'react-router-dom';

interface UserMenuProps {
  isLoggedIn: boolean;
  userAvatar: string;
  onLogout: () => void;
  onLoginClick: () => void;
}

export default function UserMenu({ isLoggedIn, userAvatar, onLogout, onLoginClick }: UserMenuProps) {
  return (
    <>
      {isLoggedIn ? (
        <>
          <Link to="/profile" aria-label="Go to profile">
            <img src={userAvatar} alt="User avatar" className="w-8 h-8 rounded-full object-cover border-2 border-[#B48DFE]" />
          </Link>
          <button
            onClick={onLogout}
            className="ml-2 px-4 py-1 rounded-full font-semibold text-white bg-gradient-to-r from-[#6A49C8] to-[#B48DFE] shadow-md hover:from-[#B48DFE] hover:to-[#6A49C8] transition-all duration-200 text-sm"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          className="px-4 py-2 bg-black/5 rounded-full font-bold text-[#16141D] opacity-60 hover:opacity-100 transition"
          onClick={onLoginClick}
        >
          Войти
        </button>
      )}
    </>
  );
}
