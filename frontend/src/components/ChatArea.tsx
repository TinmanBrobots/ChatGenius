"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Smile, Send, Loader2, MessageSquare, ChevronDown, ChevronRight, Users } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useMessages } from '@/hooks/useMessages'
import { useChannels } from '@/hooks/useChannels'
import { MessageReactions } from '@/components/MessageReactions'
import { MessageMap } from '@/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ChannelMembers } from "@/components/ChannelMembers"
import { toast } from "@/components/ui/use-toast"

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
            <AvatarImage src={message.sender?.avatar_url || undefined} alt={message.sender?.username || ''} />
            <AvatarFallback>{message.sender?.username?.charAt(0).toUpperCase() || ''}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{message.sender?.username || ''}</span>
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
                <MessageReactions messageId={message.id} reactions={message.reactions || []} />
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
  const { getChannel } = useChannels();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const channel = getChannel(channelId);

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
        parent_id: replyingTo || undefined,
        channel_id: channelId
      });
      setNewMessage('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "There was an error sending your message. Please try again.",
      })
    }
  };

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
    setShouldAutoScroll(true);
  };

  if (channel.isLoading || messages.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (channel.isError || !channel.data) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Channel not found
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">#{channel.data.name}</h2>
            {channel.data.description && (
              <p className="text-sm text-muted-foreground">{channel.data.description}</p>
            )}
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Users className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Channel Members</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <ChannelMembers channelId={channelId} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
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

