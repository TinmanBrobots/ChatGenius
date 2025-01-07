import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Channel, ApiResponse } from '@/types';
import api from '@/lib/axios';

interface CreateChannelData {
  name: string;
  description?: string;
  is_private: boolean;
  member_ids?: string[];
}

export function useChannels() {
  const queryClient = useQueryClient();

  const channels = useQuery<Channel[], Error>({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Channel[]>>('/channels');
      return response.data.data;
    },
    retry: false,
  });

  const createChannel = useMutation<ApiResponse<Channel>, Error, CreateChannelData>({
    mutationFn: async (data: CreateChannelData) => {
      const response = await api.post('/channels', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });

  return { channels, createChannel };
} 