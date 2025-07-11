import React from 'react';
import UserPageHeader from './UserPageHeader';
import UserPageTabs from './UserPageTabs';

interface UserPageProps {
  userId: number;
}

const UserPage: React.FC<UserPageProps> = ({ userId }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <UserPageHeader userId={userId} />
      <UserPageTabs userId={userId} />
    </div>
  );
};

export default UserPage;