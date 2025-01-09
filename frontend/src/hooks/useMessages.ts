import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { socket } from '@/lib/socket';
import { useEffect } from 'react';
import { Message, MessageReaction } from '@/types';

interface MessageMap {
  message: Message;
  children: Map<string, MessageMap>;
}

interface ThreadedMessages {
  rootMessages: MessageMap[];
  messageMap: Map<string, MessageMap>;
}

interface SendMessageData {
  content: string;
  parent_id?: string;
  channel_id: string;
}

interface UpdateMessageData {
  content: string;
}

interface ReactionData {
  emoji: string;
}

function createMessageMap(message: Message): MessageMap {
  return {
    message,
    children: new Map()
  };
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
    if (message.parent_id) {
      const parentMessageMap = messageMap.get(message.parent_id);
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

  // Message Queries
  const messages = useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      const response = await api.get<Message[]>(`/messages/channel/${channelId}`);
      return organizeThreads(response.data);
    },
    enabled: !!channelId,
  });

  function useGetMessage(id: string) {
    return useQuery({
      queryKey: ['message', id],
      queryFn: async () => {
        const response = await api.get<Message>(`/messages/${id}`);
        return response.data;
      },
      enabled: !!id,
    });
  }

  function useGetThreadReplies(parentId: string) {
    return useQuery({
      queryKey: ['thread', parentId],
      queryFn: async () => {
        const response = await api.get<Message[]>(`/messages/${parentId}/replies`);
        return response.data;
      },
      enabled: !!parentId,
    });
  }

  function useSearchMessages(query: string) {
    return useQuery({
      queryKey: ['messages', 'search', query],
      queryFn: async () => {
        const response = await api.get<Message[]>(`/messages/search?q=${query}`);
        return response.data;
      },
      enabled: !!query,
    });
  }

  function useGetReactions(messageId: string) {
    return useQuery({
      queryKey: ['reactions', messageId],
      queryFn: async () => {
        const response = await api.get<MessageReaction[]>(`/messages/${messageId}/reactions`);
        return response.data;
      },
      enabled: !!messageId,
    });
  }

  // Message Mutations
  const sendMessage = useMutation({
    mutationFn: async (data: SendMessageData) => {
      const response = await api.post<Message>('/messages', data);
      return response.data;
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['messages', channelId], (oldData: ThreadedMessages | undefined) => {
        if (!oldData) return organizeThreads([newMessage]);

        const { rootMessages, messageMap } = oldData;
        const newMessageMap = createMessageMap(newMessage);
        messageMap.set(newMessage.id, newMessageMap);

        if (newMessage.parent_id) {
          const parentMessageMap = messageMap.get(newMessage.parent_id);
          if (parentMessageMap) {
            parentMessageMap.children.set(newMessage.id, newMessageMap);
            return { rootMessages, messageMap };
          }
        }
        
        return {
          rootMessages: [...rootMessages, newMessageMap],
          messageMap
        };
      });
    },
  });

  const updateMessage = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateMessageData }) => {
      const response = await api.patch<Message>(`/messages/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedMessage) => {
      queryClient.setQueryData(['messages', channelId], (oldData: ThreadedMessages | undefined) => {
        if (!oldData) return;

        const { rootMessages, messageMap } = oldData;
        const messageToUpdate = messageMap.get(updatedMessage.id);
        if (messageToUpdate) {
          messageToUpdate.message = updatedMessage;
        }
        return { rootMessages, messageMap };
      });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      await api.delete<void>(`/messages/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.setQueryData(['messages', channelId], (oldData: ThreadedMessages | undefined) => {
        if (!oldData) return;

        const { rootMessages, messageMap } = oldData;
        messageMap.delete(id);
        return {
          rootMessages: rootMessages.filter(msg => msg.message.id !== id),
          messageMap
        };
      });
    },
  });

  const restoreMessage = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<Message>(`/messages/${id}/restore`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });

  const createThreadReply = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string; content: string }) => {
      const response = await api.post<Message>(`/messages/${parentId}/replies`, { content });
      return response.data;
    },
    onSuccess: (newReply) => {
      queryClient.invalidateQueries({ queryKey: ['thread', newReply.parent_id] });
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });

  const addReaction = useMutation({
    mutationFn: async ({ messageId, data }: { messageId: string; data: ReactionData }) => {
      const response = await api.post<MessageReaction>(`/messages/${messageId}/reactions`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reactions', variables.messageId] });
    },
  });

  const removeReaction = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      await api.delete<void>(`/messages/${messageId}/reactions/${emoji}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reactions', variables.messageId] });
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

        if (message.parent_id) {
          const parentMessageMap = messageMap.get(message.parent_id);
          if (parentMessageMap) {
            parentMessageMap.children.set(message.id, newMessageMap);
            return { rootMessages, messageMap };
          }
        }

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

  return {
    // Message operations
    messages,
    useGetMessage,
    sendMessage,
    updateMessage,
    deleteMessage,
    restoreMessage,
    useSearchMessages,
    // Thread operations
    useGetThreadReplies,
    createThreadReply,
    // Reaction operations
    useGetReactions,
    addReaction,
    removeReaction,
  };
} 