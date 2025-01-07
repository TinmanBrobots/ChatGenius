"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Smile, Send, Loader2, MessageSquare, ChevronDown, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useMessages } from '@/hooks/useMessages'
import { useChannels } from '@/hooks/useChannels'
import { MessageReactions } from '@/components/MessageReactions'
import { Message, MessageMap } from '@/types/message'

interface ChatAreaProps {
  channelId: string;
}

function MessageComponent({ messageMap, onReply, depth = 0 }: { 
  messageMap: MessageMap; 
  onReply: (messageId: string) => void; 
  depth?: number 
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasReplies = messageMap.children.size > 0;
  const message = messageMap.message;

  // Array of tailwind colors for thread lines
  const threadColors = [
    'border-primary',
    'border-blue-500',
    'border-green-500',
    'border-purple-500',
    'border-orange-500'
  ];

  return (
    <div className="space-y-2">
      <div className="flex relative">
        {/* Thread lines for each depth level */}
        <div className={`flex space-x-6 group ${depth > 0 ? 'ml-6' : ''} relative`}>
					{depth > 0 && Array.from({ length: depth }).map((_, index) => (
						<div
							key={index}
							className={`top-0 bottom-0 border-l-2 ${threadColors[index % threadColors.length]} opacity-30`}
							style={{ left: `${index * 16}px` }}
						/>
					))}
          <Avatar>
            <AvatarImage src={message.profiles.avatar_url || undefined} alt={message.profiles.username} />
            <AvatarFallback>{message.profiles.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{message.profiles.username}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(message.created_at).toLocaleString()}
              </span>
              {message.is_edited && (
                <span className="text-xs text-muted-foreground">(edited)</span>
              )}
              {hasReplies && (
                <span className="text-xs text-muted-foreground">
                  ({messageMap.children.size} repl{messageMap.children.size === 1 ? 'y' : 'ies'})
                </span>
              )}
            </div>
            <p className="mt-1">{message.content}</p>
            <div className="flex items-center gap-2 mt-1">
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onReply(message.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Reply
                </Button>
                <MessageReactions messageId={message.id} reactions={message.reactions} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {!isCollapsed && messageMap.children.size > 0 && (
        <div className="space-y-2 relative">
          {Array.from(messageMap.children.values()).map(childMap => (
            <MessageComponent 
              key={childMap.message.id} 
              messageMap={childMap} 
              onReply={onReply} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatArea({ channelId }: ChatAreaProps) {
  const { messages, sendMessage } = useMessages(channelId);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { channels } = useChannels();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = () => {
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle scroll events to determine if we should auto-scroll
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    
    const { scrollHeight, scrollTop, clientHeight } = scrollAreaRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  useEffect(() => {
    if (messages.data) {
      scrollToBottom();
    }
  }, [messages.data]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setShouldAutoScroll(true); // Enable auto-scroll when sending a message
      await sendMessage.mutateAsync({
        content: newMessage,
        parent_message_id: replyingTo || undefined
      });
      setNewMessage('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
    setShouldAutoScroll(true);
  };

  if (channels.isLoading || messages.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const currentChannel = channels.data?.find(channel => channel.id === channelId);

  if (!currentChannel) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Channel not found
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">#{currentChannel.name}</h2>
        {currentChannel.description && (
          <p className="text-sm text-muted-foreground">{currentChannel.description}</p>
        )}
      </div>
      <ScrollArea 
        className="flex-1 p-4" 
        onScroll={handleScroll}
        ref={scrollAreaRef}
      >
        <div className="space-y-4">
          {messages.data?.rootMessages.map((messageMap) => (
            <MessageComponent 
              key={messageMap.message.id} 
              messageMap={messageMap} 
              onReply={handleReply} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        {replyingTo && (
          <div className="flex items-center justify-between mb-2 p-2 bg-muted rounded">
            <span className="text-sm text-muted-foreground">
              Replying to a message
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
            >
              Cancel
            </Button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
            className="flex-1"
          />
          <Button type="button" size="icon" variant="ghost">
            <Smile className="w-4 h-4" />
          </Button>
          <Button type="submit" disabled={sendMessage.isPending}>
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {replyingTo ? 'Reply' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
}

