"use client"

import { useChannels } from '@/hooks/useChannels'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, MoreVertical, Crown, Shield, UserX } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from '@/hooks/useAuth'

interface ChannelMembersProps {
  channelId: string
}

export function ChannelMembers({ channelId }: ChannelMembersProps) {
  const { getChannel, getChannelMembers, updateMemberRole, removeMember } = useChannels()
  const { currentUser } = useAuth()
  const channel = getChannel(channelId)
  const members = getChannelMembers(channelId)

  if (members.isLoading || channel.isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    )
  }

  if (members.isError || channel.isError) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        Failed to load members
      </div>
    )
  }

  const isAdmin = members.data?.some(
    member => member.profile_id === currentUser?.id && member.role === 'admin'
  )

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'moderator' | 'member') => {
    try {
      await updateMemberRole.mutateAsync({
        channelId,
        profileId: memberId,
        data: { role: newRole }
      })
      toast({
        title: "Role updated",
        description: "Member role has been updated successfully.",
      })
    } catch (error) {
      console.error('Failed to update role:', error)
      toast({
        variant: "destructive",
        title: "Failed to update role",
        description: "There was an error updating the member role. Please try again.",
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember.mutateAsync({
        channelId,
        profileId: memberId
      })
      toast({
        title: "Member removed",
        description: "Member has been removed from the channel.",
      })
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast({
        variant: "destructive",
        title: "Failed to remove member",
        description: "There was an error removing the member. Please try again.",
      })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {members.data?.map((member) => (
          <div key={member.profile_id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={member.profile?.avatar_url || undefined} alt={member.profile?.username || ''} />
                <AvatarFallback>{member.profile?.username?.charAt(0).toUpperCase() || ''}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{member.profile?.username || ''}</span>
                  {getRoleIcon(member.role)}
                </div>
                {member.profile?.full_name && (
                  <p className="text-sm text-muted-foreground">{member.profile.full_name}</p>
                )}
              </div>
            </div>
            {isAdmin && member.profile_id !== currentUser?.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleRoleChange(member.profile_id, 'admin')}>
                    <Crown className="h-4 w-4 mr-2" />
                    Make Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleChange(member.profile_id, 'moderator')}>
                    <Shield className="h-4 w-4 mr-2" />
                    Make Moderator
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRoleChange(member.profile_id, 'member')}>
                    Remove Role
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => handleRemoveMember(member.profile_id)}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Remove from Channel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 