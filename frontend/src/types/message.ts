export interface Reaction {
  emoji: string;
  user_id: string;
  profiles: {
    username: string;
  };
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  is_edited: boolean;
  parent_message_id: string | null;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  reactions: Reaction[];
}

export interface MessageMap {
  message: Message;
  children: Map<string, MessageMap>;
} 