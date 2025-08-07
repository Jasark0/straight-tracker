"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Select: React.FC = () => {
    const router = useRouter();

    const [gameName, setGameName] = useState('');
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [raceTo, setRaceTo] = useState('50');
    const [breakMethod, setBreakMethod] = useState<'random' | 'lag'>('random');

    const [lagPopup, setLagPopup] = useState(false);
    const [lagWinnerSelected, setLagWinnerSelected] = useState<1|2|null>(null);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (breakMethod === 'lag'){
            setLagPopup(true);
            return;
        }
        
        await submitMatch(null);
    };

    const submitMatch = async (finalLagWinner: number|null) => {
        try {
            const res = await fetch('/api/createStraightMatch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game_name: gameName,
                    player1: player1,
                    player2: player2,
                    race_to: raceTo,
                    lag_winner: finalLagWinner,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('API error:', errorData.error);
                return;
            }

            const result = await res.json();

            router.push(`/tracker/straight-pool?matchID=${result.match_id}`);
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    }


    return (
        <div className="select-page-box">
            <div className={`select-box ${lagPopup ? "blurred" : ""}`}>
                <form onSubmit={handleSubmit}>
                    <p className="game-name-message">What would your legendary straight pool game name be today?</p>
                    <input className="game-name-input" type="text" placeholder="Game Name (optional)" value={gameName} onChange={(e) => setGameName(e.target.value)} />
                    
                    <img src="/divider.png" className="divider-css"></img>

                    <div className="names-selection-message">   
                        <p className="names-message">Players, Type Your Names.</p>
                    </div>

                    <div className="names-selection-box">
                        <div className="player-names">
                            <label className="player-names-label">Player 1:</label>
                            <input className="player-names-input" type="text" placeholder="Type your name" value={player1} onChange={(e) => setPlayer1(e.target.value)} />
                        </div>

                        <div className="player-names">
                            <label className="player-names-label">Player 2:</label>
                            <input className="player-names-input" type="text" placeholder="Type your name" value={player2} onChange={(e) => setPlayer2(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="race-sets-box">
                        <div className="race-box">
                            <label className="race-label">Race to (balls):</label>
                            <input
                                className="race-input"
                                type="text"
                                inputMode="numeric"
                                pattern="^[1-9][0-9]*$"
                                value={raceTo}
                                onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                    setRaceTo(val);
                                }
                                }}
                                required
                                title="Please enter a number greater than 0."
                            />
                        </div>
                    
                    </div>

                    <div className="lag-box">
                        <label className="lag-label">Who breaks first?</label>
                        <div className="break-method-box">
                            <label>
                                <input type="radio" name="breakMethod" value="random" checked={breakMethod === 'random'}
                                onChange={() => setBreakMethod('random')}/>
                                Randomize
                            </label>
                            <label>
                                <input type="radio" name="breakMethod" value="lag" checked={breakMethod === 'lag'}
                                onChange={() => setBreakMethod('lag')}/>
                                Lag for Break
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="submit-button">Start Match</button>
                </form>
            </div>

            {lagPopup && (
                <div className="modal-overlay" onClick={() => { if (lagWinnerSelected) { setLagPopup(false); }}}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <p className="lag-text">Players, lag for break at this time.</p>
                        <p className="lag-winner-text">Pick a lag winner:</p>
                        <div className="lag-button-box">
                            <button className={`player1-lag-button ${ lagWinnerSelected === 1 ? 'active-red' : ''}`} onClick={() => setLagWinnerSelected(1)}>
                                {player1 || 'Player1'}
                            </button>
                                
                            <button className={`player2-lag-button ${lagWinnerSelected === 2 ? 'active-blue' : ''}`} onClick={() => setLagWinnerSelected(2)}>
                                {player2 || 'Player2'}
                            </button>
                        </div>

                        <button className="continue-button" disabled={!lagWinnerSelected}
                            onClick={() => {
                                setLagPopup(false);
                                submitMatch(lagWinnerSelected);
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Select;
