'use client';

import { useChannels } from '@/hooks/useChannels';
import { Channel } from '@/types';
import { Hash, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ChannelList() {
  const { channels } = useChannels();

  if (channels.isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (channels.isError) {
    return (
      <Alert variant="destructive" className="my4">
        <AlertDescription>
          Failed to load channels. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!channels.data || channels.data.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No channels available
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {channels.data.map((channel: Channel) => (
        <li key={channel.id} className="flex items-center space-x-2">
          <Hash className="w-4 h-4" />
          <Link 
            href={`/chat/${channel.id}`} 
            className="text-sm hover:underline truncate"
          >
            {channel.name}
          </Link>
        </li>
      ))}
    </ul>
  );
} 