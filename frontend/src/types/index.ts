// User related types
export interface User {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  custom_status?: string;
  created_at: string;
  updated_at: string;
}

// Channel related types
export interface Channel {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChannelMember {
  channel_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
}

// Message related types
export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  is_edited: boolean;
  parent_message_id?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

// Direct Message types
export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

// File Attachment types
export interface Attachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
}

// Auth related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
  full_name: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Socket Event types
export interface TypingEvent {
  user_id: string;
  channel_id: string;
}

export interface MessageEvent {
  message: Message;
  channel_id: string;
}

// Component Prop types
export interface ChannelListProps {
  channels: Channel[];
}

export interface ChatAreaProps {
  channelId: string;
}

export interface MessageItemProps {
  message: Message;
  isThread?: boolean;
}

export interface ChannelCreationFormProps {
  onClose: () => void;
} 