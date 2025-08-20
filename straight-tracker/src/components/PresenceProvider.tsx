"use client";

import { createClient } from '@/utils/supabase/client';
import React, { createContext, useContext, useEffect, useState} from 'react';

type Presence = {
    user_id: string;
    username: string;
};

const PresenceContext = createContext<string[]>([]);

export const PresenceProvider = ({ children }: { children: React.ReactNode}) => {
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const supabase = createClient();

    useEffect( () => {
        const channel = supabase.channel('online-users');

        const updateOnlineUsers = () => {
            const presenceState = channel.presenceState<Presence>();
            const userIds = Object.values(presenceState)
                .flat()
                .map((p) => p.user_id);
            setOnlineUsers(Array.from(new Set(userIds)));
        };

        channel
            .on('presence', { event: 'sync' }, updateOnlineUsers)
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await channel.track({
                            user_id: user.id,
                            username: user.user_metadata.username,
                        });
                    }
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    return (
        <PresenceContext.Provider value={onlineUsers}>
            {children}
        </PresenceContext.Provider>
    );
}

export const usePresence = () => {
    return useContext(PresenceContext);
};