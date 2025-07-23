// Тип данных для регистрации
interface RegisterData {
  email: string;
  password: string;
  name: string;
  privacy: string;
}

// Тип описания желания
export interface Wish {
  id: number;
  title: string;
  description?: string | null;
  image_url?: string | null;
  goal: number;
  raised: number;
  owner_id: number;
  is_public: boolean;
}

// Интерфейс данных профиля
export interface ProfileData {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  description?: string;
  social_facebook?: string;
  social_twitter?: string;
  social_instagram?: string;
  privacy?: 'public' | 'friends' | 'private';
  is_influencer?: boolean;
}

// Интерфейс пользователя
export interface UserProfileData {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
  description: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  isFriend?: boolean;
}

export interface UpdatedProfileData {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  description?: string;
  social_facebook?: string;
  social_twitter?: string;
  social_instagram?: string;
  privacy?: 'public' | 'friends' | 'private';
  is_influencer?: boolean;
  isFriend: boolean;
}

// Интерфейс пользователя из списка
export interface UserListItem {
  id: number;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  mutualFriends: number;
  wishlistsCount: number;
  isFriend: boolean;
}

export interface NotificationType {
  friend_request: 'friend_request';
  message: 'message';
  join_request: "join_request";
}

export interface NotificationStatus {
    pending: "pending";
    accepted: "accepted";
    rejected: "rejected";
    dismissed: "dismissed";
}

export interface Notification {
  id: number;
  recipient_id: number;
  sender_id?: number | null;
  community_id: number | null;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string; // ISO дата
  status: string
}

interface GetNotificationsParams {
  readFilter?: boolean;
  limit?: number;
}

export interface UserOut {
  id: number;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  image_url: string;
  members: number;
  category: string;
  totalWishes: number;
  totalFunded: number;
  isActive: boolean;
  created_at: datetime;
  members_count?: number | null;
  wishes_count?: number | null;
}

interface Member {
  id: string;
  name: string;
  avatar_url: string;
  role: 'admin' | 'member' | 'moderator';
  isOnline: boolean;
  contributions: number;
}

interface WishCommunity {
  id: string;
  title: string;
  description: string;
  image: string;
  targetAmount: number;
  currentAmount: number;
  contributors: number;
  daysLeft: number;
  isUrgent: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
}