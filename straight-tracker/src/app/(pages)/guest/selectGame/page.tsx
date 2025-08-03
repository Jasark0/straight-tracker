'use client';

import React from 'react'
import { useRouter } from 'next/navigation'

export default function selectGame(){
    const router = useRouter();

    const selectPage = (selectedGameType: string) => {
        if (selectedGameType === "8 Ball"){
            router.push('/guest/select/8-ball');
        }
        else if (selectedGameType === "9 Ball"){
            router.push('/guest/select/9-ball'); 
        }
    }

    const signUpPage = () => {
        router.push('/signup');
    }

    return (
        <div className="history-select-modal">
            <div className="history-select-modal-content">
                <h2>Select a Game Type</h2>
                <div className="history-select-game-options">
                    {["8 Ball", "9 Ball"].map((game) => (
                        <button className="history-select-game-option" key={game} onClick={() => selectPage(game)}>
                            {game}
                        </button>
                    ))}
                </div>
                
                <p className="guest-suggestion-text">Only 8-ball & 9-ball are offered as a guest, <br/> 
                    <span className="guest-make-text" onClick={signUpPage}>make an account today</span> to access other games!
                </p>
                <p className="guest-warning-text">Warning: all data is not saved as a guest!</p>
            </div>
        </div>
    )
}
