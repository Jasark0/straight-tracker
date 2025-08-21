"use client";

import { usePresence } from './PresenceProvider';

export const OnlineStatusIcon = ({ userId }: { userId: string }) => {
    const { onlineUsers, isLoading } = usePresence();
    const isOnline = onlineUsers.includes(userId);

    return (
        <span className='member-online-status-icon'>
            {isLoading ? '' : (isOnline ? '🟢' : '🔴')}
        </span>
    );
};