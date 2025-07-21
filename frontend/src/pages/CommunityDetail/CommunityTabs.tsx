import { Info, Users, Gift, MessageCircle } from 'lucide-react';

export default function CommunityTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'info', label: 'Информация', icon: Info },
    { id: 'members', label: 'Участники', icon: Users },
    { id: 'wishes', label: 'Желания', icon: Gift },
    { id: 'chat', label: 'Чат', icon: MessageCircle },
  ];

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <nav className="flex overflow-x-auto no-scrollbar flex-nowrap space-x-2 sm:space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center justify-center gap-0 sm:gap-2 py-2 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap
                  ${
                    isActive
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                aria-label={tab.label} // для доступности на мобильных
              >
                <Icon className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
