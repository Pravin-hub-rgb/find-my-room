'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

interface EditRoomButtonProps {
  roomId: string
  roomUserId: string
}

export function EditRoomButton({ roomId, roomUserId }: EditRoomButtonProps) {
  const [isOwner, setIsOwner] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkOwnership = async () => {
      // Get current user
      const { data: userData } = await supabase.auth.getUser()
      
      if (userData?.user) {
        // Check if current user is the owner of this room
        setIsOwner(userData.user.id === roomUserId)
      }
      setLoading(false)
    }
    
    checkOwnership()
  }, [roomUserId])

  if (loading || !isOwner) return null

  return (
    <Button 
      onClick={() => router.push(`/rooms/${roomId}/edit`)}
      variant="outline"
      className="ml-auto"
    >
      Edit Room
    </Button>
  )
}