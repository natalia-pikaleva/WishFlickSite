import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, Plus, Trash2, X } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface WishItem {
  id: number;
  title: string;
  description: string;
  image?: string;
  progress: number; // процент сбора средств
  raised: number;   // собранная сумма
  goal: number;     // цель
}

const initialWishes: WishItem[] = [
  {
    id: 1,
    title: "4K Monitor",
    description: "Ultra HD monitor for creative work and gaming",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
    progress: 60,
    raised: 300,
    goal: 500,
  },
  {
    id: 2,
    title: "Wireless Headphones",
    description: "Noise-cancelling over-ear headphones",
    image: "https://images.unsplash.com/photo-1512499617640-c2f99912b5c9?auto=format&fit=crop&w=400&q=80",
    progress: 30,
    raised: 90,
    goal: 300,
  },
];

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<{
	  title: string;
	  description: string;
	  image: string;
	  goal: string;
	  is_public: boolean;
	}>({
	  title: '',
	  description: '',
	  image: '',
	  goal: '',
	  is_public: false,  // по умолчанию — не публичное
	});

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchWishes = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          alert('Please login first');
          return;
        }
        const response = await axios.get(`${API_BASE_URL}/wishes`, {
		  headers: {
		    Authorization: `Bearer ${token}`,
		  },
		});
        // Преобразуем данные, если нужно, например, считаем progress
        const wishesWithProgress = response.data.map((wish: any) => ({
          ...wish,
          progress: wish.goal > 0 ? Math.round((wish.raised / wish.goal) * 100) : 0,
          image: wish.image_url,
        }));
        setWishes(wishesWithProgress);
      } catch (error: any) {
        alert(error.response?.data?.detail || 'Failed to load wishes');
      }
    };

    fetchWishes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	  if (e.target.files && e.target.files[0]) {
	    setAvatarFile(e.target.files[0]);
	    setFormData(prev => ({ ...prev, image: '' }));
	  }
	};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please login first');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('goal', formData.goal);
    formDataToSend.append('is_public', formData.is_public ? 'true' : 'false');

    if (avatarFile) {
      formDataToSend.append('image_file', avatarFile);
    } else if (formData.image) {
      formDataToSend.append('image_url', formData.image);
    }

    const response = await axios.post(`${API_BASE_URL}/wishes`, formDataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    alert('Wish created successfully!');
    setIsFormOpen(false);
    setFormData({ title: '', description: '', image: '', goal: '', is_public: false });
    setAvatarFile(null);

    // Обновление списка желаний
    const newWish = response.data;
    setWishes(prev => [
      ...prev,
      {
        id: newWish.id,
        title: newWish.title,
        description: newWish.description,
        image: newWish.image_url,
        goal: newWish.goal,
        raised: newWish.raised,
        progress: newWish.goal > 0 ? Math.round((newWish.raised / newWish.goal) * 100) : 0,
      },
    ]);
  } catch (error: any) {
    alert(error.response?.data?.detail || 'Failed to create wish');
  }
};


  const handleRemove = async (id: number) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Please login first');
      return;
    }

    await axios.delete(`${API_BASE_URL}/wishes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setWishes(prevWishes => prevWishes.filter(wish => wish.id !== id));
  } catch (error: any) {
    alert(error.response?.data?.detail || 'Failed to delete wish');
  }
};



  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] bg-clip-text text-transparent">
        Your Wishlist
      </h1>

      {/* Кнопка открытия формы */}
      {!isFormOpen && (
        <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-[#6A49C8] transition-colors duration-300 mb-8 max-w-md mx-auto">
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex flex-col items-center justify-center p-8 text-[#6A49C8] hover:text-[#B48DFE]"
          >
            <Plus className="w-10 h-10 mb-2" />
            <span className="font-semibold text-lg">Add New Wish</span>
          </button>
        </div>
      )}

      {/* Форма создания нового желания */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md p-8 max-w-lg mx-auto mb-12"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Create New Wish</h2>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close form"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <label className="block mb-4">
            <span className="text-gray-700 font-medium">Title</span>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
              placeholder="Enter wish title"
            />
          </label>

          <label className="block mb-4">
            <span className="text-gray-700 font-medium">Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
              placeholder="Describe your wish"
            />
          </label>

          <label className="block mb-4">
			  <span className="text-gray-700 font-medium">Image URL</span>
			  <input
			    type="url"
			    name="image"
			    value={formData.image}
			    onChange={handleChange}
			    disabled={!!avatarFile} // блокируем, если выбран файл
			    className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
			    placeholder="https://example.com/image.jpg"
			  />
			</label>

			<label className="block mb-4">
			  <span
			  className="text-gray-700 font-medium"
			  >Or upload image</span>
			  <input
			    type="file"
			    accept="image/*"
			    onChange={handleFileChange}
			    className="mt-1 block w-full"
			  />
			</label>


          <label className="block mb-6">
            <span className="text-gray-700 font-medium">Goal Amount ($)</span>
            <input
              type="number"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              required
              min={1}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
              placeholder="Enter fundraising goal"
            />
          </label>

          <label className="flex items-center mb-6 space-x-2">
		    <input
		      type="checkbox"
		      name="is_public"
		      checked={formData.is_public}
		      onChange={e => setFormData({ ...formData, is_public: e.target.checked })}
		      className="rounded border-gray-300 text-[#6A49C8] focus:ring-[#B48DFE]"
		    />
		    <span className="text-gray-700 font-medium">Make wish public</span>
		  </label>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full font-semibold hover:shadow-lg transition-shadow duration-300"
          >
            Create Wish
          </button>
        </form>
      )}

      {/* Список желаний */}
      <div className="grid md:grid-cols-2 gap-8">
        {wishes.map((wish) => (
          <div
		  key={wish.id}
		  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
		>
		  {wish.image && (
		    <img
		      src={wish.image}
		      alt={wish.title}
		      className="w-full h-48 object-cover"
		      onError={e => {
		        e.currentTarget.onerror = null;
		        e.currentTarget.src = '/fallback-image.png';
		      }}
		    />
		  )}
		  <div className="p-6">
		    <h2
		      onClick={() => navigate(`/wishes/${wish.id}`)}
		      className="text-2xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-[#6A49C8] transition-colors"
		    >
		      {wish.title}
		    </h2>
		    <p className="text-gray-600 mb-4">{wish.description}</p>

		    <div className="mb-4">
		      <div className="flex justify-between text-sm text-gray-700 mb-1">
		        <span>Raised: ${wish.raised}</span>
		        <span>Goal: ${wish.goal}</span>
		      </div>
		      <div className="w-full bg-gray-200 rounded-full h-3">
		        <div
		          className="bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] h-3 rounded-full transition-all duration-500"
		          style={{ width: `${wish.progress}%` }}
		        />
		      </div>
		    </div>

		    <button
		      type="button"
		      onClick={() => navigate(`/wishes/${wish.id}`)}
		      className="mb-3 w-full py-2 bg-[#6A49C8] text-white rounded-full font-semibold hover:bg-[#B48DFE] transition-colors duration-300"
		    >
		      View Details
		    </button>

		    <button
		      type="button"
		      onClick={() => handleRemove(wish.id)}
		      className="flex items-center justify-center gap-2 w-full py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors duration-300"
		    >
		      <Trash2 className="w-5 h-5" />
		      Remove
		    </button>
		  </div>
		</div>

        ))}
      </div>
    </main>
  );
};

export default Wishlist;
