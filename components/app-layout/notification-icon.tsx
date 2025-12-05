"use client";
import React from 'react'
import { Button } from '../ui/button'
import { Bell } from 'lucide-react'

const NotificationIcon = () => {
    return (
        <div>
            <Button
                size="icon"
                variant="ghost"
                onClick={() => alert("You have 5 Notification pending.")}
            >
                <Bell />
            </Button>
        </div>
    )
}

export default NotificationIcon
