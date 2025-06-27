import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface WishEditFormProps {
  wishId: number;
  initialData: {
    title: string;
    description: string;
    image_url?: string;
    goal: number;
    is_public: boolean;
  };
  onClose: () => void;
  onUpdated: (updatedWish: any) => void;
}

const WishEditForm: React.FC<WishEditFormProps> = ({ wishId, initialData, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    title: initialData.title,
    description: initialData.description,
    image_url: initialData.image_url || '',
    goal: initialData.goal,
    is_public: initialData.is_public,
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setFormData(prev => ({ ...prev, image_url: '' })); // очищаем URL, если выбран файл
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Пожалуйста, войдите на сайт');
        setLoading(false);
        return;
      }

      const dataToSend = new FormData();
      dataToSend.append('title', formData.title);
      dataToSend.append('description', formData.description);
      dataToSend.append('goal', formData.goal.toString());
      dataToSend.append('is_public', formData.is_public ? 'true' : 'false');

      if (avatarFile) {
        dataToSend.append('image_file', avatarFile);
      } else if (formData.image_url) {
        dataToSend.append('image_url', formData.image_url);
      }

      const response = await axios.patch(`${API_BASE_URL}/wishes/${wishId}`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      onUpdated(response.data);
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Ошибка при редактировании желания');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Редактирование желания</h2>

      <label className="block mb-3">
        <span className="text-gray-700">Название</span>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
      </label>

      <label className="block mb-3">
        <span className="text-gray-700">Описание</span>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full border rounded px-3 py-2"
        />
      </label>

      <label className="block mb-4">
        <span className="text-gray-700 font-medium">Ссылка на картинку</span>
        <input
          type="url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          disabled={!!avatarFile}
          className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#B48DFE] focus:border-transparent"
          placeholder="https://example.com/image.jpg"
        />
      </label>

      <label className="block mb-4">
        <span className="text-gray-700 font-medium">Или загрузите картинку</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1 block w-full"
        />
      </label>

      <label className="block mb-3">
        <span className="text-gray-700">Цель (₽)</span>
        <input
          name="goal"
          type="number"
          min={1}
          value={formData.goal}
          onChange={handleChange}
          required
          className="w-full border rounded px-3 py-2"
        />
      </label>

      <label className="flex items-center mb-4 space-x-2">
        <input
          type="checkbox"
          name="is_public"
          checked={formData.is_public}
          onChange={handleChange}
          className="rounded border-gray-300 text-[#6A49C8] focus:ring-[#B48DFE]"
        />
        <span className="text-gray-700">Сделать желание публичным</span>
      </label>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
          disabled={loading}
        >
          Отмена
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white font-semibold hover:shadow-lg"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default WishEditForm;
