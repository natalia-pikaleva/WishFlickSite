import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar() {
  return (
    <div className="hidden md:flex relative w-48">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        placeholder="Поиск желаний..."
        className="pl-10 pr-4 py-2 border border-gray-200 rounded-full w-full focus:ring-2 focus:ring-[#B48DFE] text-sm bg-white"
      />
    </div>
  );
}
