'use client';

import { useChannels } from '@/hooks/useChannels';
import { Channel } from '@/types';
import { Hash, Lock, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

export function ChannelList() {
  const { channels } = useChannels();
  console.log(JSON.stringify(channels, null, 2))
  const params = useParams();
  const currentChannelId = params?.channelId as string;

  if (channels.isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (channels.isError) {
    return (
      <Alert variant="destructive" className="my-4">
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

  // Sort channels: public first, then private, alphabetically within each group
  const sortedChannels = [...channels.data].sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === 'private' ? 1 : -1;
  });

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase px-2">
          Channels
        </div>
        <ul className="space-y-1">
          {sortedChannels.map((channel: Channel) => (
            <li key={channel.id}>
              <Link 
                href={`/chat/${channel.id}`} 
                className={cn(
                  "flex items-center px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors",
                  "group relative",
                  currentChannelId === channel.id && "bg-accent"
                )}
              >
                {channel.type === 'private' ? (
                  <Lock className="w-4 h-4 mr-2 text-muted-foreground" />
                ) : (
                  <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
                )}
                <span className="truncate flex-1">{channel.name}</span>
                {/* {channel.unread_count > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {channel.unread_count}
                  </span>
                )} */}
                {channel.description && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md invisible group-hover:visible whitespace-nowrap">
                    {channel.description}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 