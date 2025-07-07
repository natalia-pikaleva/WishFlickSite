import React from 'react';
import UserPageHeader from './UserPageHeader';
import UserPageTabs from './UserPageTabs';

const UserPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <UserPageHeader />
      <UserPageTabs />
    </div>
  );
};

export default UserPage;