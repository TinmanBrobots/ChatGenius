import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Channel, ChannelMember } from '@/types';
import api from '@/lib/axios';

interface CreateChannelData {
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  member_ids?: string[];
  created_by: string;
}

interface UpdateChannelData {
  name?: string;
  description?: string;
  type?: 'public' | 'private' | 'direct';
}

interface UpdateMemberRoleData {
  role: 'admin' | 'moderator' | 'member';
}

interface UpdateMemberSettingsData {
  notifications_enabled?: boolean;
  muted_until?: string | null;
}

export function useChannels() {
  const queryClient = useQueryClient();

  // Channel Queries
  const channels = useQuery<Channel[], Error>({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await api.get<Channel[]>('/channels');
      return response.data;
    },
    retry: false,
  });

  const getChannel = (id: string) => useQuery<Channel, Error>({
    queryKey: ['channel', id],
    queryFn: async () => {
      const response = await api.get<Channel>(`/channels/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const searchChannels = (query: string) => useQuery<Channel[], Error>({
    queryKey: ['channels', 'search', query],
    queryFn: async () => {
      const response = await api.get<Channel[]>(`/channels/search?q=${query}`);
      return response.data;
    },
    enabled: !!query,
  });

  // Channel Mutations
  const createChannel = useMutation<Channel, Error, CreateChannelData>({
    mutationFn: async (data: CreateChannelData) => {
      const response = await api.post<Channel>('/channels', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });

  const updateChannel = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateChannelData }) => {
      const response = await api.patch<Channel>(`/channels/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });

  const archiveChannel = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<Channel>(`/channels/${id}/archive`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });

  const deleteChannel = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<void>(`/channels/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });

  // Channel Member Queries
  const getChannelMembers = (channelId: string) => useQuery<ChannelMember[], Error>({
    queryKey: ['channelMembers', channelId],
    queryFn: async () => {
      const response = await api.get<ChannelMember[]>(`/channels/${channelId}/members`);
      return response.data;
    },
    enabled: !!channelId,
  });

  // Channel Member Mutations
  const addMember = useMutation({
    mutationFn: async ({ channelId, profileId }: { channelId: string; profileId: string }) => {
      const response = await api.post<ChannelMember>(`/channels/${channelId}/members`, { profile_id: profileId });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channelMembers', variables.channelId] });
    },
  });

  const removeMember = useMutation({
    mutationFn: async ({ channelId, profileId }: { channelId: string; profileId: string }) => {
      const response = await api.delete<void>(`/channels/${channelId}/members/${profileId}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channelMembers', variables.channelId] });
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ channelId, profileId, data }: { channelId: string; profileId: string; data: UpdateMemberRoleData }) => {
      const response = await api.patch<ChannelMember>(`/channels/${channelId}/members/${profileId}/role`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channelMembers', variables.channelId] });
    },
  });

  const updateMemberSettings = useMutation({
    mutationFn: async ({ channelId, profileId, data }: { channelId: string; profileId: string; data: UpdateMemberSettingsData }) => {
      const response = await api.patch<ChannelMember>(`/channels/${channelId}/members/${profileId}/settings`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channelMembers', variables.channelId] });
    },
  });

  const updateLastRead = useMutation({
    mutationFn: async ({ channelId, profileId }: { channelId: string; profileId: string }) => {
      const response = await api.post<ChannelMember>(`/channels/${channelId}/members/${profileId}/read`);
      return response.data;
    },
  });

  const toggleMute = useMutation({
    mutationFn: async ({ channelId, profileId }: { channelId: string; profileId: string }) => {
      const response = await api.post<ChannelMember>(`/channels/${channelId}/members/${profileId}/mute`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channelMembers', variables.channelId] });
    },
  });

  return {
    // Channel operations
    channels,
    getChannel,
    searchChannels,
    createChannel,
    updateChannel,
    archiveChannel,
    deleteChannel,
    // Member operations
    getChannelMembers,
    addMember,
    removeMember,
    updateMemberRole,
    updateMemberSettings,
    updateLastRead,
    toggleMute,
  };
} 