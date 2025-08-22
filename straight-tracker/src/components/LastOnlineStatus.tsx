"use client";

import { usePresence } from './PresenceProvider';

const timeAgo = (dateString: string | null): string => {
    if (!dateString) {
        return 'Unknown';
    }

    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (seconds < 10) return "just now";
    if (seconds < 60) return `${seconds} seconds ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
};

export const LastOnlineStatus = ({ userId, lastOnline }: { userId: string, lastOnline: string | null }) => {
    const { onlineUsers, isLoading } = usePresence();
    const isOnline = onlineUsers.includes(userId);

    if (isLoading) {
        return <span>...</span>; 
    }

    return (
        <span>
            {isOnline ? '' : `Last Online: ${timeAgo(lastOnline)}`}
        </span>
    );
};