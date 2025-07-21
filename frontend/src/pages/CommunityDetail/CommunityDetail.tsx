import React, { useEffect, useState, useRef  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { updateCommunity, deleteCommunity, getCommunityById, fetchCommunityMembers } from '../../utils/api/communityApi';
import {
	getCommunityChatMessages,
	sendCommunityChatMessage,
	deleteCommunityChatMessage } from '../../utils/api/communityChatApi';

import CommunityHeader from './CommunityHeader';
import CommunityTabs from './CommunityTabs';
import CommunityMembersList from './CommunityMembersList';
import CommunityInfo from './CommunityInfo';
import CommunityChat from './CommunityChat';

import { WishCommunity } from '../types';
import { STATIC_BASE_URL } from '../../config';

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '/default-avatar.png';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${STATIC_BASE_URL}${imageUrl}`;
};

const CommunityDetail = () => {
  const token = localStorage.getItem('access_token');
  const currentUserId = localStorage.getItem('user_id');

  const { communityId } = useParams<{ communityId: string }>();
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'wishes' | 'chat'>('info');
  const [community, setCommunity] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(null);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: community?.name || '',
    description: community?.description || '',
    rules: community?.rules || '',
    image: null as File | null,
  });
  const [saving, setSaving] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!communityId) return;
    setLoading(true);
    getCommunityById(Number(communityId))
      .then(res => setCommunity(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [communityId]);

  useEffect(() => {
	  if (!communityId) return;
	  (async () => {
	    try {
	      const result = await fetchCommunityMembers(token, Number(communityId));
	      setMembers(result);
	    } catch (e) {
	      setMembers([]);
	    }
	  })();
	}, [communityId, token]);

  useEffect(() => {
    if (showSettingsModal && community) {
      setEditForm({
        name: community.name,
        description: community.description || '',
        rules: community.rules || '',
        image: null,
      });
    }
  }, [showSettingsModal, community]);

  // 1. Загрузка сообщений при монтировании/смене communityId
  useEffect(() => {
    let cancelled = false;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const messages = await getCommunityChatMessages(Number(communityId));
        if (!cancelled) setChatMessages(messages);
      } catch (e) {
        // Обработайте ошибку (например, покажите тост)
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMessages();
    return () => { cancelled = true; };
  }, [communityId]);

  // 2. Простое polling (каждые 10 секунд)
  useEffect(() => {
    // Можно вынести в отдельный хук useInterval
    const interval = setInterval(async () => {
      const messages = await getCommunityChatMessages(Number(communityId));
      setChatMessages(messages);
    }, 10000);
    setPolling(interval);
    return () => clearInterval(interval);
  }, [communityId]);

  // 3. Прокрутка вниз при новых сообщениях
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // 4. Обработка отправки сообщения
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const sent = await sendCommunityChatMessage(token, {
        community_id: Number(communityId),
        message: newMessage
      });
      setChatMessages((msgs) => [...msgs, sent]);
      setNewMessage('');
    } catch (e) {
      // Обработайте ошибку
    }
  };

  // 5. Удаление сообщения — если надо
  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Удалить сообщение?')) {
      try {
        await deleteCommunityChatMessage(token, messageId);
        setChatMessages((msgs) => msgs.filter((m) => m.id !== messageId));
      } catch (e) {
        // Обработка ошибки
      }
    }
  };



  if (loading || !community) {
    return <div className="text-center py-12 text-lg text-gray-500">Загрузка...</div>;
  }

  const currentMember = members.find((m) => m.id === currentUserId);
  const isAdmin = currentMember?.role === 'admin';

  // Моки для желаний, если нет API
  const wishes: WishCommunity[] = [
    {
      id: '1',
      title: 'Cyberpunk 2077',
      description: 'Соберем средства на совместное прохождение нашумевшей игры',
      image: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=300',
      targetAmount: 15000,
      currentAmount: 12500,
      contributors: 25,
      daysLeft: 5,
      isUrgent: true
    },
    {
      id: '2',
      title: 'Gaming Headset',
      description: 'Качественная гарнитура для командных игр',
      image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=300',
      targetAmount: 8000,
      currentAmount: 5600,
      contributors: 18,
      daysLeft: 12,
      isUrgent: false
    },
    {
      id: '3',
      title: 'Mechanical Keyboard',
      description: 'Механическая клавиатура для лучшего игрового опыта',
      image: 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg?auto=compress&cs=tinysrgb&w=300',
      targetAmount: 12000,
      currentAmount: 3200,
      contributors: 12,
      daysLeft: 20,
      isUrgent: false
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Админ';
      case 'moderator': return 'Модератор';
      default: return 'Участник';
    }
  };
  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleDeleteCommunity = async () => {
    if (!window.confirm('Вы действительно хотите удалить это сообщество?')) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteCommunity(token!, Number(communityId));
      setShowSettingsModal(false);
      navigate('/communities');
    } catch (e: any) {
      setDeleteError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleCommunitySettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSettingsError('');
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('description', editForm.description);
      formData.append('rules', editForm.rules);
      if (editForm.image) formData.append('image_file', editForm.image);

      await updateCommunity(token!, Number(communityId), formData);
      setShowSettingsModal(false);

      // Перезагрузка данных
      const updated = await getCommunityById(Number(communityId));
      setCommunity(updated);
    } catch (e: any) {
      setSettingsError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const adminMember = members.find(m => m.role === 'admin');
  const adminId = adminMember?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-teal-50">
      <CommunityHeader
        community={community}
        membersCount={members.length}
        wishesCount={wishes.length}
        isAdmin={isAdmin}
        onShare={() => alert('Поделиться')}
        onSettings={() => setShowSettingsModal(true)}
        onBack={() => navigate('/communities')}
        getImageUrl={getImageUrl}
        formatNumber={formatNumber}
      />
      <CommunityTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'info' && (
          <CommunityInfo
          community={community}
          formatNumber={formatNumber}
          membersCount={members.length}
          wishesCount={wishes.length}
          adminId={adminId}
           />
        )}
        {activeTab === 'members' && (
          <CommunityMembersList
            members={members}
            getRoleColor={getRoleColor}
            getRoleText={getRoleText}
            formatCurrency={formatCurrency}
          />
        )}
        {activeTab === 'wishes' && (
		  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
		    {wishes.map((wish) => (
		      <div key={wish.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
		        <div className="relative">
		          <img src={wish.image} alt={wish.title} className="w-full h-36 sm:h-48 object-cover" />
		          {wish.isUrgent && (
		            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs sm:text-sm font-medium">
		              Срочно
		            </div>
		          )}
		        </div>
		        <div className="p-3 sm:p-6">
		          <h3 className="text-lg sm:text-xl font-semibold mb-1">{wish.title}</h3>
		          <p className="text-gray-600 mb-3 text-xs sm:text-base">{wish.description}</p>
		          {/* другие блоки карточки */}
		          <button className="w-full bg-gradient-to-r from-purple-500 to-teal-500 text-white py-2 px-2 sm:px-4 rounded-lg text-sm sm:text-base mt-2">
		            Поддержать
		          </button>
		        </div>
		      </div>
		    ))}
		  </div>
		)}

        {activeTab === 'chat' && (
         <CommunityChat
	        chatMessages={chatMessages}
	        currentUserId={String(currentUserId)}
	        newMessage={newMessage}
	        setNewMessage={setNewMessage}
	        handleSendMessage={handleSendMessage}
	        token={token}
	        messagesEndRef={messagesEndRef}
	      />
        )}

        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <form
              className="w-full max-w-lg mx-4 md:w-[400px] bg-white shadow-xl p-8 flex flex-col space-y-6 relative rounded-none sm:rounded-xl"
              style={{ maxWidth: '95vw', width: '100%' }}
              onSubmit={handleCommunitySettingsSubmit}
            >
              <button
                type="button"
                className="absolute top-3 right-4 text-gray-300 hover:text-gray-900 text-3xl"
                onClick={() => setShowSettingsModal(false)}
                aria-label="Закрыть"
              >×</button>
              <h2 className="text-2xl font-semibold mb-2">Настройки сообщества</h2>
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Название"
                value={editForm.name}
                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <textarea
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Описание"
                value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
              />
              <textarea
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Правила сообщества"
                value={editForm.rules}
                onChange={e => setEditForm(f => ({ ...f, rules: e.target.value }))}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                type="file"
                accept="image/*"
                onChange={e =>
                  setEditForm(f => ({
                    ...f,
                    image: e.target.files && e.target.files[0] ? e.target.files[0] : null,
                  }))
                }
              />
              {settingsError && <div className="text-red-500 text-sm">{settingsError}</div>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white font-semibold py-2 rounded-lg transition"
                disabled={saving}
              >
                Сохранить
              </button>
              {deleteError && (
                <div className="text-red-600 text-sm mb-2">{deleteError}</div>
              )}
              <button
                type="button"
                onClick={handleDeleteCommunity}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition mt-4"
                disabled={deleting}
              >
                {deleting ? 'Удаляем...' : 'Удалить сообщество'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDetail;
