'use client'

import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import ReactiveButton from 'reactive-button';

export default function EditProfileButton() {
    const router = useRouter();
    const [state, setState] = useState('idle');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const resetStates = () => {
        setState('idle');
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    };

    const onClickHandler = () => {
        setState('loading');

        abortControllerRef.current = new AbortController();
        
        timeoutRef.current = setTimeout(() => { 
            if (!abortControllerRef.current?.signal.aborted) {
                setState('success');
                
                // Navigate after showing success briefly
                setTimeout(() => {
                    if (!abortControllerRef.current?.signal.aborted) {
                        router.push('/settings');
                    }
                }, 500);
            }
        }, 1500); // Show loading for 1.5 seconds
    };

    let reactiveButtonColor = 'blue';
    if (state === 'success') {
        reactiveButtonColor = 'green';
    } else if (state === 'loading') {
        reactiveButtonColor = 'blue';
    }

    return (
        <div className="member-editProfile-Button-container">
            <ReactiveButton 
                onClick={onClickHandler}
                idleText="Edit Profile"
                loadingText="Loading..."
                successText="Redirecting..."
                buttonState={state}
                rounded={true}
                shadow={true}
                width={"100%"}
                size='large'
                color={reactiveButtonColor}
                className="member-editProfile-Button"
            />
        </div>
    );
}