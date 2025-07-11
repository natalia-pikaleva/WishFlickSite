import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

const PostsTab: React.FC = () => {
  const posts = [
    {
      id: 1,
      content: 'Только что добавила камеру своей мечты в список своих желаний по фотографии! 📸 На один шаг ближе к началу моего профессионального фотографического пути. Поддержка сообщества была невероятной!',
      image: 'https://avatars.mds.yandex.net/i?id=3be8cb7c15f5307fa7b522ead776f222_l-5554842-images-thumbs&n=13&w=600',
      timestamp: '2 часа назад',
      likes: 42,
      comments: 8,
      shares: 3,
      isLiked: true,
      wishlistTag: 'Настройка фотосъемки мечты'
    },
    {
      id: 2,
      content: 'Спасибо всем, кто внес свой вклад в мой список пожеланий по художественным принадлежностям! 🎨 У меня уже есть несколько потрясающих наборов акварельных красок. Ваша поддержка очень много значит для меня! ✨',
      image: null,
      timestamp: '1 день назад',
      likes: 89,
      comments: 15,
      shares: 12,
      isLiked: false,
      wishlistTag: 'Коллекция предметов искусства'
    },
    {
      id: 3,
      content: 'Планирую свое приключение в Юго-Восточной Азии! 🌏 Добавлены некоторые необходимые для путешествия предметы снаряжения ',
      image: 'https://avatars.mds.yandex.net/i?id=809317af397205976392a6c83b5e410c_l-9180497-images-thumbs&n=13&w=600',
      timestamp: '3 дня назад',
      likes: 156,
      comments: 24,
      shares: 18,
      isLiked: true,
      wishlistTag: 'Путешествия'
    }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-lg font-medium hover:from-purple-600 hover:to-teal-500 transition-all duration-200">
          Share Update
        </button>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-teal-300 flex items-center justify-center">
                  <img
                    src="https://avatars.mds.yandex.net/i?id=27a07fc7d3d209e395abce88607a0c51b280ad37-4507619-images-thumbs&n=13&w=100"
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Александра Петрова</h4>
                  <p className="text-sm text-gray-500">{post.timestamp}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Wishlist Tag */}
            {post.wishlistTag && (
              <div className="mb-3">
                <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-100 to-teal-100 text-purple-700 text-sm font-medium rounded-full">
                  🎯 {post.wishlistTag}
                </span>
              </div>
            )}

            {/* Post Content */}
            <p className="text-gray-800 mb-4 leading-relaxed">{post.content}</p>

            {/* Post Image */}
            {post.image && (
              <div className="mb-4">
                <img
                  src={post.image}
                  alt="Post content"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <button className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  post.isLiked 
                    ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-500 hover:text-red-500 hover:bg-gray-50'
                }`}>
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{formatNumber(post.likes)}</span>
                </button>
                
                <button className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-blue-500 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{post.comments}</span>
                </button>
                
                <button className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-green-500 hover:bg-gray-50 rounded-lg transition-all duration-200">
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">{post.shares}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostsTab;