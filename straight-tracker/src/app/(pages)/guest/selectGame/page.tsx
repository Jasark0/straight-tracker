'use client';

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function selectGame(){
    const router = useRouter();

    const [selectedGame, setSelectedGame] = useState('');

    const gameSelect = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();

        const target = e.target as HTMLElement;

        if (!target.closest(".game-option")){
            setSelectedGame('');
        }
    }

    const selectPage = () => {
        if (selectedGame === "8 Ball"){
            router.push('/guest/select/8-ball');
        }
        else if (selectedGame === "9 Ball"){
            router.push('/guest/select/9-ball'); 
        }
    }

    return (
        <div className="guest-selectgame-container">
            <div className="modal-overlay">
                <div className="modal-content" onClick={gameSelect}>
                    <h2>Select a Game Type</h2>
                    <div className="game-options">
                        {["8 Ball", "9 Ball"].map((game) => (
                            <button className={`game-option ${selectedGame === game ? "selected" : ""}`} key={game} onClick={() => setSelectedGame(game)}>
                                {game}
                            </button>
                        ))}
                    </div>
                    <p className="guest-suggestion-text">Only 8-ball & 9-ball are offered as a guest, make an account today to access other games!</p>
                    <p className="guest-warning-text">Warning: all data is not saved as a guest!</p>
                         
                    {selectedGame && (
                        <div className="confirm-footer">
                            <button className="next-button" onClick={selectPage}>Next</button>
                        </div>
                    )}
                </div>
            </div>
        </div> 
    )
}
