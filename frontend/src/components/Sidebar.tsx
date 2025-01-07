"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChannelList } from "@/components/ChannelList"
import { DirectMessages } from "@/components/direct-messages"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/hooks/useAuth'
import { ChannelCreationForm } from "@/components/ChannelCreationForm"
import { useState } from 'react'

export function Sidebar() {
  const { logout } = useAuth()
  const [showChannelForm, setShowChannelForm] = useState(false)

  return (
    <div className="w-64 border-r bg-muted/50">
      <div className="p-4 font-semibold flex justify-between items-center">
        <span>ChatGenius</span>
        <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
      </div>
      <Separator />
      <ScrollArea className="h-[calc(100vh-57px)]">
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Channels</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowChannelForm(true)}>+</Button>
          </div>
          {showChannelForm && (
            <ChannelCreationForm 
              onClose={() => setShowChannelForm(false)} 
            />
          )}
          <ChannelList />
          <Separator className="my-4" />
          <DirectMessages />
        </div>
      </ScrollArea>
    </div>
  )
}

