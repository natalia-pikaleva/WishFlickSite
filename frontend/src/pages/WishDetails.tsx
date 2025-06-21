import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const WishDetails = () => {
  const { wishId } = useParams<{ wishId: string }>();
  const [wish, setWish] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };

        const [wishResponse, commentsResponse, likesResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/wishes/${wishId}`, { headers }),
          axios.get(`${API_BASE_URL}/wishes/${wishId}/comments`, { headers }),
          axios.get(`${API_BASE_URL}/wishes/${wishId}/likes/count`, { headers }),
        ]);

        setWish(wishResponse.data);
        setComments(Array.isArray(commentsResponse.data) ? commentsResponse.data : []);
        setLikesCount(likesResponse.data.count || 0);
      } catch (error) {
        console.error('Failed to load data', error);
      } finally {
        setLoading(false);
      }
    }
    if (wishId) {
      fetchData();
    }
  }, [wishId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_BASE_URL}/comments`,
        { wish_id: Number(wishId), content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      // Обновляем комментарии после добавления
      const commentsResponse = await axios.get(`${API_BASE_URL}/wishes/${wishId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(Array.isArray(commentsResponse.data) ? commentsResponse.data : []);
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  };

  const handleLike = async () => {
    if (likeLoading) return; // предотвращаем повторные клики
    try {
      setLikeLoading(true);
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_BASE_URL}/likes`,
        { wish_id: Number(wishId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // После лайка обновляем счётчик лайков
      const likesResponse = await axios.get(`${API_BASE_URL}/wishes/${wishId}/likes/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikesCount(likesResponse.data.count || 0);
    } catch (error: any) {
      if (error.response?.status === 400) {
        alert('Вы уже поставили лайк этому желанию.');
      } else {
        console.error('Failed to like wish', error);
      }
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!wish) return <div>Wish not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{wish.title}</h1>

      {/* Фото желания */}
      {wish.image_url && (
        <img
          src={wish.image_url}
          alt={wish.title}
          className="w-full max-h-96 object-contain mb-6 rounded-lg shadow-md"
          onError={e => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/fallback-image.png'; // запасное изображение
          }}
        />
      )}

      <p className="mb-4">{wish.description}</p>

      <div className="mb-4">
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`px-4 py-2 rounded-full font-semibold text-white transition-colors ${
            likeLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] hover:brightness-110'
          }`}
        >
          ❤️ {likesCount} {likeLoading ? '...' : ''}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Комментарии</h2>
        {comments.length === 0 && <p>Комментариев пока нет.</p>}
        <ul>
          {comments.map(comment => (
            <li key={comment.id} className="border-b py-2">
              <p>{comment.content}</p>
              <small className="text-gray-500">От: {comment.user?.name || 'Unknown'}</small>
            </li>
          ))}
        </ul>

        <textarea
          className="w-full border rounded p-2 mt-4 mb-2"
          rows={3}
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Добавьте комментарий"
        />
        <button
          onClick={handleAddComment}
          className="px-4 py-2 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white rounded-full"
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default WishDetails;
