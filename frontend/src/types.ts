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
  // Добавьте другие типы по необходимости
}

export interface Notification {
  id: number;
  recipient_id: number;
  sender_id?: number | null;
  type: string; // или конкретный enum, если хотите
  message: string;
  is_read: boolean;
  created_at: string; // ISO дата
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