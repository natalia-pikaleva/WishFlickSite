import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.jpg';

export default function Logo() {
  return (
    <Link to="/" className="flex items-center min-w-0 mr-4">
      <img src={logo} alt="WishFlick Logo" className="w-32 h-12 object-contain flex-shrink-0" />
    </Link>
  );
}
