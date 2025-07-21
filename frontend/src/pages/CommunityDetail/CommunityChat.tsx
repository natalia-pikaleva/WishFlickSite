import { Send } from 'lucide-react';

export default function CommunityChat({ chatMessages, currentUserId, newMessage, setNewMessage, handleSendMessage, token }) {
  return (
    <div className="bg-white rounded-xl shadow-sm h-96 flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Групповой чат</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${String(message.user_id) === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-3 max-w-xs lg:max-w-md ${String(message.user_id) === currentUserId ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`rounded-lg px-4 py-2 ${
                String(message.user_id) === currentUserId
                  ? 'bg-gradient-to-r from-purple-500 to-teal-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {!String(message.user_id) === currentUserId && (
                  <div className="text-xs font-medium mb-1">{message.user_name}</div>
                )}
                <div className="text-sm">{message.message}</div>
                <div className={`text-xs mt-1 ${
                  String(message.user_id) === currentUserId ? 'text-purple-100' : 'text-gray-500'
                }`}>
                  {new Date(message.sent_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Напишите сообщение..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-purple-500 to-teal-500 text-white p-2 rounded-lg hover:from-purple-600 hover:to-teal-600"
            disabled={!token}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
