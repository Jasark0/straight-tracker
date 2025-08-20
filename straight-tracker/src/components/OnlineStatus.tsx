"use client";

import { usePresence } from './PresenceProvider';

export const OnlineStatus = ({ userId}: { userId: string}) => {
    const onlineUsers = usePresence();
    const isOnline = onlineUsers.includes(userId);

    return (
        <span>
            {isOnline ? 'Online' : 'Offline'}
        </span>
    );
};