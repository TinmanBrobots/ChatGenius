"use client"

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthContext } from '@/providers/AuthProvider';
import { Reaction } from '@/types/message';

// Common emoji reactions
const commonEmojis = ['👍', '❤️', '😂', '🎉', '🤔', '👀', '🚀', '💯'];

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
}

export function MessageReactions({ messageId, reactions }: MessageReactionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  // Group reactions by emoji
  const reactionGroups = reactions.reduce((acc: Record<string, Reaction[]>, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {});

  const addReaction = useMutation({
    mutationFn: async (emoji: string) => {
      const response = await api.post(`/messages/${messageId}/reactions`, { emoji });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setIsOpen(false);
    }
  });

  const removeReaction = useMutation({
    mutationFn: async (emoji: string) => {
      await api.delete(`/messages/${messageId}/reactions/${emoji}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  const handleEmojiClick = async (emoji: string) => {
		for (const r of reactions) {
			console.log(r.emoji, emoji, r.user_id, user?.id)
		}
    const hasReacted = reactions.some(
      r => r.emoji === emoji && r.user_id === user?.id
    );

    if (hasReacted) {
      await removeReaction.mutateAsync(emoji);
    } else {
      await addReaction.mutateAsync(emoji);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Smile className="h-4 w-4 mr-1" />
            React
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2" align="start">
          <div className="grid grid-cols-4 gap-2">
            {commonEmojis.map(emoji => {
              const hasReacted = reactions.some(
                r => r.emoji === emoji && r.user_id === user?.id
              );
              return (
                <Button
                  key={emoji}
                  variant={hasReacted ? "secondary" : "ghost"}
                  className="h-8 w-8 p-0"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Existing reactions */}
      <div className="flex gap-1">
        {Object.entries(reactionGroups).map(([emoji, reactions]) => {
          const hasReacted = reactions.some(r => r.user_id === user?.id);
          return (
            <Button
              key={emoji}
              variant={hasReacted ? "secondary" : "outline"}
              size="sm"
              className="h-6 px-2 gap-1"
              onClick={() => handleEmojiClick(emoji)}
            >
              <span>{emoji}</span>
              <span className="text-xs">{reactions.length}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
} 