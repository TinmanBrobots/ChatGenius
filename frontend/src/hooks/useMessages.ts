import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { socket } from '@/lib/socket';
import { useEffect } from 'react';
import { Message, MessageMap } from '@/types/message';

function createMessageMap(message: Message): MessageMap {
  return {
    message,
    children: new Map()
  };
}

interface ThreadedMessages {
  rootMessages: MessageMap[];
  messageMap: Map<string, MessageMap>;
}

function organizeThreads(messages: Message[]): ThreadedMessages {
  const messageMap = new Map<string, MessageMap>();
  const rootMessages: MessageMap[] = [];

  // Sort messages by creation date (oldest first)
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // First pass: create MessageMap objects for all messages
  sortedMessages.forEach(message => {
    messageMap.set(message.id, createMessageMap(message));
  });

  // Second pass: organize messages into thread hierarchy
  sortedMessages.forEach(message => {
    const currentMessageMap = messageMap.get(message.id)!;
    if (message.parent_message_id) {
      const parentMessageMap = messageMap.get(message.parent_message_id);
      if (parentMessageMap) {
        parentMessageMap.children.set(message.id, currentMessageMap);
      } else {
        // If parent not found, treat as root message
        rootMessages.push(currentMessageMap);
      }
    } else {
      rootMessages.push(currentMessageMap);
    }
  });

  return { rootMessages, messageMap };
}

export function useMessages(channelId: string) {
  const queryClient = useQueryClient();

  const messages = useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      const response = await api.get(`/messages/channel/${channelId}`);
      const rawMessages = response.data as Message[];
      return organizeThreads(rawMessages);
    },
    enabled: !!channelId,
  });

  const sendMessage = useMutation({
    mutationFn: async (data: { content: string; parent_message_id?: string }) => {
      const response = await api.post(`/messages/channel/${channelId}`, data);
      return response.data as Message;
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['messages', channelId], (oldData: ThreadedMessages | undefined) => {
        if (!oldData) return organizeThreads([newMessage]);

        const { rootMessages, messageMap } = oldData;
        const newMessageMap = createMessageMap(newMessage);
        messageMap.set(newMessage.id, newMessageMap);

        if (newMessage.parent_message_id) {
          const parentMessageMap = messageMap.get(newMessage.parent_message_id);
          if (parentMessageMap) {
            parentMessageMap.children.set(newMessage.id, newMessageMap);
            return { rootMessages, messageMap };
          }
        }
        
        // If no parent or parent not found, add to root at the end
        return {
          rootMessages: [...rootMessages, newMessageMap],
          messageMap
        };
      });
    },
  });

  // Handle real-time updates
  useEffect(() => {
    if (!channelId) return;

    socket.emit('join_channel', channelId);

    const handleNewMessage = (message: Message) => {
      queryClient.setQueryData(['messages', channelId], (oldData: ThreadedMessages | undefined) => {
        if (!oldData) return organizeThreads([message]);

        const { rootMessages, messageMap } = oldData;
        // Avoid duplicate messages
        if (messageMap.has(message.id)) return oldData;

        const newMessageMap = createMessageMap(message);
        messageMap.set(message.id, newMessageMap);

        if (message.parent_message_id) {
          const parentMessageMap = messageMap.get(message.parent_message_id);
          if (parentMessageMap) {
            parentMessageMap.children.set(message.id, newMessageMap);
            return { rootMessages, messageMap };
          }
        }

        // If no parent or parent not found, add to root at the end
        return {
          rootMessages: [...rootMessages, newMessageMap],
          messageMap
        };
      });
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.emit('leave_channel', channelId);
      socket.off('new_message', handleNewMessage);
    };
  }, [channelId, queryClient]);

  return { messages, sendMessage };
} 