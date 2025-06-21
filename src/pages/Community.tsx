import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Heart, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

interface Wish {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  goal: number;
  raised?: number;
  owner_id: number;
  owner_name?: string;
  owner_avatar?: string;
  likes_count: number;
  comments_count: number;
  is_public: boolean;
}

const Community = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishes() {
      try {
        const response = await axios.get<Wish[]>(`${API_BASE_URL}/community/wishes`);
        setWishes(response.data);
      } catch (error) {
        console.error('Failed to fetch wishes', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWishes();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (wishes.length === 0) return <div>No wishes found.</div>;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] bg-clip-text text-transparent">
        Community Wishlist
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wishes.map((wish) => (
          <div key={wish.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
            {wish.image_url && (
              <img src={wish.image_url} alt={wish.title} className="w-full h-48 object-cover rounded mb-4" />
            )}
            <Link to={`/wishes/${wish.id}`} className="text-xl font-semibold text-[#6A49C8] hover:underline mb-2">
              {wish.title}
            </Link>
            <p className="text-gray-700 flex-grow">{wish.description}</p>
            <div className="flex items-center justify-between mt-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span>{wish.likes_count}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>{wish.comments_count}</span>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Owner: {wish.owner_name}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Community;
