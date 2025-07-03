import React from 'react';

interface WishListProps {
  wishes?: string[]; // или более сложная структура
}

const WishListProfile: React.FC<WishListProps> = ({ wishes }) => {
  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Мои желания</h3>
      <ul>
        {wishes.map((wish, index) => (
          <li key={index} className="mb-2">{wish}</li>
        ))}
      </ul>
    </div>
  );
};

export default WishListProfile;
