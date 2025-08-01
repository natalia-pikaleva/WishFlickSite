import React, { useState, useEffect } from 'react';
import { Heart, Users, Calendar, ExternalLink } from 'lucide-react';
import { getUserWishes, Wish, createWish, updateWish, deleteWish } from '../../../utils/api/wishApi';
import {
  likeWish,
  unlikeWish,
  getWishLikes,
} from '../../../utils/api/likeApi';

import { useNavigate } from 'react-router-dom';

const WishlistsTab: React.FC = () => {
  const navigate = useNavigate();

  const [wishlists, setWishlists] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWish, setEditingWish] = useState<Wish | null>(null);

  const isGuest = localStorage.getItem('isGuest') === 'true';

  const [likeState, setLikeState] = useState<{ [wishId: number]: boolean }>({});
  const [likesCount, setLikesCount] = useState<{ [wishId: number]: number }>({});


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
    is_public: false,
  });

  useEffect(() => {
    const fetchWishes = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('Пользователь не авторизован');

        const wishes = await getUserWishes(token);
        setWishlists(wishes);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishes();
  }, []);

  const openCreateForm = () => {
    setEditingWish(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      goal: '',
      is_public: false,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (wish: Wish) => {
	  setEditingWish(wish);
	  setFormData({
	    title: wish.title,
	    description: wish.description,
	    image: wish.image_url || '',
	    goal: wish.goal.toString(),
	    is_public: wish.is_public,
	  });
	  setIsFormOpen(true);
	};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
	  const { name, value, type, checked } = e.target;
	  setFormData(prev => ({
	    ...prev,
	    [name]: type === 'checkbox' ? checked : value,
	  }));
	};

  useEffect(() => {
	  const fetchLikes = async () => {
	    const token = localStorage.getItem('access_token');
	    if (!token) return;
	    try {
	      const myId = Number(localStorage.getItem('user_id'));
	      let likeObj: { [wishId: number]: boolean } = {};
	      let countObj: { [wishId: number]: number } = {};
	      for (let wish of wishlists) {
	        const userIds = await getWishLikes(wish.id);
	        likeObj[wish.id] = userIds.includes(myId);
	        countObj[wish.id] = userIds.length;
	      }
	      setLikeState(likeObj);
	      setLikesCount(countObj);
	    } catch {}
	  };
	  if (wishlists.length > 0) fetchLikes();
	}, [wishlists]);

  const handleLike = async (wishId: number) => {
	  const token = localStorage.getItem("access_token");
	  if (!token) return;
	  try {
	    await likeWish(token, wishId);
	    setLikeState(state => ({ ...state, [wishId]: true }));
	    setLikesCount(c => ({ ...c, [wishId]: (c[wishId] ?? 0) + 1 }));
	  } catch {}
	};

  const handleUnlike = async (wishId: number) => {
	  const token = localStorage.getItem("access_token");
	  if (!token) return;
	  try {
	    await unlikeWish(token, wishId);
	    setLikeState(state => ({ ...state, [wishId]: false }));
	    setLikesCount(c => ({ ...c, [wishId]: Math.max((c[wishId] ?? 1) - 1, 0) }));
	  } catch {}
	};




  const handleSubmit = async (e: React.FormEvent) => {
	  console.log('Submit clicked')
	  e.preventDefault();
	  setLoading(true);
	  setError(null);

	  console.log('formData.goal:', formData.goal);
	  const goalNumber = Number(formData.goal);
	  console.log('goalNumber:', goalNumber);


	  if (isNaN(goalNumber) || goalNumber <= 0) {
	    setError('Поле "Цель" должно быть положительным числом');
	    setLoading(false);
	    return;
	  }

	  try {
	    const token = localStorage.getItem('access_token');
	    if (!token) throw new Error('Пользователь не авторизован');

	    const formDataToSend = new FormData();
	    formDataToSend.append('title', formData.title);
	    formDataToSend.append('description', formData.description);
	    formDataToSend.append('goal', goalNumber.toString());
	    formDataToSend.append('is_public', formData.is_public ? 'true' : 'false');

	    if (formData.image) {
	      formDataToSend.append('image_url', formData.image);
	    }

	    let resultWish;
	    if (editingWish) {
	      resultWish = await updateWish(token, editingWish.id, formDataToSend);
	      setWishlists(prev =>
	        prev.map(w => (w.id === editingWish.id ? resultWish : w))
	      );
	    } else {
	      resultWish = await createWish(token, formDataToSend);
	      setWishlists(prev => [...prev, resultWish]);
	    }

	    setIsFormOpen(false);
	    setFormData({
	      title: '',
	      description: '',
	      image: '',
	      goal: '',
	      is_public: false,
	    });
	  } catch (e: any) {
	    setError(e.message);
	  } finally {
	    setLoading(false);
	  }
	};



  const handleRemove = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это желание?')) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Пользователь не авторизован');

      await deleteWish(token, id);
      setWishlists(prev => prev.filter(w => w.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Желания</h3>
        <>
        {!isGuest && (
	        <button
	          onClick={openCreateForm}
		      className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-lg font-medium hover:from-purple-600 hover:to-teal-500 transition-all duration-200 text-sm sm:text-base"
	        >
	          Добавить новое
	        </button>
	      )}
		</>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-white shadow-sm">
          <label className="block mb-2 font-medium">
            Название
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-2 py-1 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </label>
          <label className="block mb-2 font-medium">
            Описание
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-2 py-1 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </label>
          <label className="block mb-2 font-medium">
			  Ссылка на картинку
			  <input
			    name="image"
			    value={formData.image}
			    onChange={handleChange}
			    className="w-full border border-gray-300 px-2 py-1 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
			  />
		  </label>

          <label className="block mb-2 font-medium">
            Цель (₽)
            <input
              name="goal"
              type="number"
              value={formData.goal}
              onChange={handleChange}
              required
              min={1}
              className="w-full border border-gray-300 px-2 py-1 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </label>
          <label className="flex items-center mb-4 font-medium">
            <input
              type="checkbox"
              name="is_public"
              checked={formData.is_public}
              onChange={handleChange}
              className="mr-2"
            />
            Сделать желание публичным
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-lg font-medium hover:from-purple-600 hover:to-teal-500 transition-all duration-200 text-sm"
            >
              {editingWish ? 'Сохранить изменения' : 'Создать желание'}
            </button>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {loading && <p>Загрузка...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {wishlists.map(wish => (
          <div
            key={wish.id}
            className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 group"
          >
            <div className="relative">
              <img
                src={wish.image_url || '/default-image.png'}
                alt={wish.title}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    wish.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {wish.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </div>

            <div className="p-5">
              <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {wish.title}
              </h4>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{wish.description}</p>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{formatCurrency(wish.raised || 0)} собрано</span>
                  <span>{formatCurrency(wish.goal)} цель</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-teal-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(wish.raised || 0, wish.goal)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
				  <button
				    className={`p-1 rounded-full transition hover:bg-gray-100
				      ${likeState[wish.id] ? "text-pink-500" : "text-gray-400"}
				    `}
				    aria-label={likeState[wish.id] ? "Убрать лайк" : "Поставить лайк"}
				    onClick={() =>
				      likeState[wish.id]
				        ? handleUnlike(wish.id)
				        : handleLike(wish.id)
				    }
				    disabled={isGuest}
				  >
				    <Heart
				      className={`w-5 h-5 transition
				        ${likeState[wish.id] ? "fill-pink-500" : ""}
				      `}
				      fill={likeState[wish.id] ? "#ec4899" : "none"}
				      strokeWidth={2}
				    />
				  </button>
				  <span>
				    {likesCount[wish.id] ?? 0}
				  </span>
				</div>

                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{/* Кол-во участников */}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{/* Дата дедлайна */}</span>
                </div>
              </div>

              <div className="flex gap-2">

                  {!isGuest && (
					  <>
					  <button
					    onClick={() => openEditForm(wish)}
					    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-lg font-medium hover:from-purple-600 hover:to-teal-500 transition-all duration-200 text-sm"
					  >
					    Редактировать
					  </button>
					  <button
					    onClick={() => handleRemove(wish.id)}
					    className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-800 transition-all duration-200 text-sm"
					  >
					    Удалить
					  </button>
					  </>
				   )}
			  </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistsTab;
