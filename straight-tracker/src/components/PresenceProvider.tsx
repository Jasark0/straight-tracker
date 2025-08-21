"use client";

import { createClient } from '@/utils/supabase/client';
import React, { createContext, useContext, useEffect, useState} from 'react';
import { type User} from '@supabase/supabase-js';

type Presence = {
    user_id: string;
    username: string;
};

type PresenceContextType = {
    onlineUsers: string[];
    onlineCount: number;
    isLoading: boolean;
};

const PresenceContext = createContext<PresenceContextType>({ 
    onlineUsers: [], 
    onlineCount: 0, 
    isLoading: true 
});

const openTabsKey = 'open-tabs-counter';

export const PresenceProvider = ({ children }: { children: React.ReactNode}) => {
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    

    useEffect( () => {
        if (performance.navigation.type === performance.navigation.TYPE_NAVIGATE) {
            const currentCount = parseInt(localStorage.getItem(openTabsKey) || '0', 10);
            if (currentCount <= 0) {
                localStorage.setItem(openTabsKey, '0');
            }
        }

        const openTabs = parseInt(localStorage.getItem(openTabsKey) || '0', 10) + 1;
        localStorage.setItem(openTabsKey, openTabs.toString());

        let currentUser: string | null = null;
        const channel = supabase.channel('online-users', {
            config: {private: false } // Possible security concern if this is publicly accessible,
        });

        /* 
        More context on the security concern:
        Tried to set up where realtime.subscription has rls policies but supabase doesn't support that yet.
        As of now, we have this solution for online presence.
        Alternative solutions I have seen was presence tracking, but i'll look more into that later
        */

        const updateOnlineUsers = () => {
            const presenceState = channel.presenceState<Presence>();
            const userIds = Object.values(presenceState)
                .flat()
                .map((p) => p.user_id);
            setOnlineUsers(Array.from(new Set(userIds)));
            setIsLoading(false); // Set loading to false after first sync
        };

        channel
            .on('presence', { event: 'sync' }, updateOnlineUsers)
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    const { data: { user } } = await supabase.auth.getUser();
                    currentUser = user?.id || null;
                    if (user) {
                        await channel.track({
                            user_id: user.id,
                            username: user.user_metadata.username,
                        });
                    }
                }
            });

        const handleBeforeUnload = () => {
            const openTabs = parseInt(localStorage.getItem(openTabsKey) || '1', 10) - 1;
            localStorage.setItem(openTabsKey, openTabs.toString());

            if (openTabs === 0) {
                navigator.sendBeacon('/api/updateLastOnline');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <PresenceContext.Provider value={{ onlineUsers, onlineCount: onlineUsers.length, isLoading }}>
            {children}
        </PresenceContext.Provider>
    );
}

export const usePresence = () => {
    return useContext(PresenceContext);
};