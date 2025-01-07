"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useChannels } from '@/hooks/useChannels'
import { useRouter } from 'next/navigation'
import { Hash, Lock } from 'lucide-react'

interface ChannelCreationFormProps {
  onClose: () => void
}

export function ChannelCreationForm({ onClose }: ChannelCreationFormProps) {
  const [channelName, setChannelName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const { createChannel } = useChannels()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const channel = await createChannel.mutateAsync({
        name: channelName.toLowerCase().replace(/\s+/g, '-'),
        description,
        is_private: isPrivate
      })
      onClose()
      // Navigate to the new channel
      router.push(`/chat?channel=${channel.data.id}`)
    } catch (error) {
      console.error('Failed to create channel:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="channel-name">Channel name</Label>
        <div className="relative">
          <div className="absolute left-2 top-2.5 text-muted-foreground">
            {isPrivate ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
          </div>
          <Input
            id="channel-name"
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="new-channel"
            className="pl-8"
            required
            pattern="^[a-zA-Z0-9-]+$"
            title="Channel names can only contain letters, numbers, and hyphens"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Channel names can only contain lowercase letters, numbers, and hyphens.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="channel-description">Description</Label>
        <Textarea
          id="channel-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this channel about?"
          className="resize-none"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Let others know what this channel is for.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center">
            <Label htmlFor="private-channel" className="mr-2">Private channel</Label>
            <Switch
              id="private-channel"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Private channels are only visible to their members
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        <Button 
          type="submit" 
          disabled={createChannel.isPending || !channelName.trim()}
        >
          {createChannel.isPending ? 'Creating...' : 'Create Channel'}
        </Button>
      </div>
    </form>
  )
}

