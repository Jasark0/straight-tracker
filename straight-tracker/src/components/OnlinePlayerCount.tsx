"use client";

import { usePresence } from './PresenceProvider';

export const OnlinePlayerCount = () => {
    const { onlineCount, isLoading } = usePresence();

    if (isLoading) {
        return (
            <div className="home-online-count">
                <span className="home-online-indicator-dot"></span>
                <span className="home-online-text">Loading...</span>
            </div>
        );
    }

    return (
        <div className="home-online-count">
            <span className="home-online-indicator-dot"></span>
            <span className="home-online-text">
                {onlineCount} player{onlineCount !== 1 ? 's' : ''} online
            </span>
        </div>
    );
};
