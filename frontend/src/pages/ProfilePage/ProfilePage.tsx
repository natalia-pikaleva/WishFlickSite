import React from 'react';
import ProfilePageHeader from './ProfilePageHeader';
import ProfilePageTabs from './ProfilePageTabs';


const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ProfilePageHeader />
      <ProfilePageTabs />
    </div>
  );
};

export default ProfilePage;