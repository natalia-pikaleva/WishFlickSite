import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

interface User {
  id: number;
  name?: string;
  avatar_url?: string;
}

interface Wish {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  goal: number;
  raised: number;
  supporters: number;
  timeLeft: string; // например, "10 days left"
  category?: string;
  owner: User;
}

const baseUrl = API_BASE_URL;
const backendBaseUrl = API_BASE_URL;

const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return '/default-avatar.png';
  if (avatarUrl.startsWith('http') || avatarUrl.startsWith('https')) {
    return avatarUrl;
  }
  return `${backendBaseUrl}${avatarUrl}`;
};


const PublicInfluencerWishlists = () => {
  const [wishlists, setWishlists] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlists() {
      try {
        const response = await axios.get<Wish[]>(`${API_BASE_URL}/wishes/influencer`);
        setWishlists(response.data);
      } catch (error) {
        console.error('Failed to fetch wishlists', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWishlists();
  }, []);

  if (loading) {
    return <p className="max-w-6xl mx-auto p-4">Loading...</p>;
  }

  if (wishlists.length === 0) {
    return <p className="max-w-6xl mx-auto p-4">No public influencer wishlists found.</p>;
  }

  return (
    <section className="max-w-6xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] bg-clip-text text-transparent">
		Public Wishlists of Influencers</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlists.map(wish => {
          const progress = Math.min((wish.raised / wish.goal) * 100, 100);

          return (
            <div key={wish.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="relative">
                <img
                  src={wish.image_url || '/default-image.png'}
                  alt={wish.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {wish.category && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#B48DFE] text-white px-3 py-1 rounded-full text-sm font-medium">
                      {wish.category}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <Link to={`/wishes/${wish.id}`} className="text-xl text-[#6A49C8] hover:underline font-semibold">
                  {wish.title}
                </Link>
                <p className="mt-2 text-gray-700 line-clamp-3">{wish.description}</p>

                {wish.owner && (
                  <div className="flex items-center mt-4 space-x-3">
                    <img
					  src={getAvatarUrl(wish.owner.avatar_url)}
					  alt={wish.owner.name || 'Influencer'}
					  className="w-10 h-10 rounded-full object-cover"
					/>

                    <span className="font-medium">{wish.owner.name}</span>
                  </div>
                )}

                <div className="space-y-3 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">${wish.raised} / ${wish.goal}</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      {/* Здесь можно добавить иконку */}
                      <span>{wish.supporters} supporters</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {/* Здесь можно добавить иконку */}
                      <span>{wish.timeLeft}</span>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-4 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300">
                  Support This Wish
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PublicInfluencerWishlists;
