import { createNotification } from '../../utils/api/notificationsApi';
import { useState } from 'react';

export default function CommunityInfo({ community, formatNumber, membersCount, wishesCount, adminId }) {
  // Получить id текущего пользователя (замени на свой способ)
  const userId = localStorage.getItem('user_id');
  const userName = localStorage.getItem('user_name')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">О сообществе</h3>
          <p className="text-gray-600 leading-relaxed">{community.description}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Правила сообщества</h3>
          <ul className="space-y-2">
            {(community.rules || '')
              .split(/\s*-\s+/)
              .map((rule, i) => rule.trim())
              .filter(Boolean)
              .map((rule, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <span className="text-gray-600">{rule}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Статистика</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Участники</span>
              <span className="font-semibold">{formatNumber(membersCount ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Желания</span>
              <span className="font-semibold">{wishesCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Профинансировано</span>
              <span className="font-semibold text-green-600">{community.totalFunded}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Создано</span>
              <span className="font-semibold">{new Date(community.created_at).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
