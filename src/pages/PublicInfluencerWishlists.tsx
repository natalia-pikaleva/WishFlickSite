import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';


const PublicInfluencerWishlists = () => {
  const [wishlists, setWishlists] = useState<any[]>([]);

  useEffect(() => {
    async function fetchWishlists() {
      const response = await axios.get(`${API_BASE_URL}/wishes?public=true&influencer=true`); // предполагаемый API с фильтрами
      setWishlists(response.data);
    }
    fetchWishlists();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Публичные вишлисты инфлюенсеров</h1>
      <ul>
        {wishlists.map(wish => (
          <li key={wish.id} className="mb-4 border-b pb-2">
            <Link to={`/wishes/${wish.id}`} className="text-xl text-[#6A49C8] hover:underline">
              {wish.title}
            </Link>
            <p>{wish.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PublicInfluencerWishlists;
