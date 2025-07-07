"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getUserSession } from '@/actions/auth';

import Header from '@/src/components/Header';

const Select: React.FC = () => {
    const router = useRouter();

    const [gameName, setGameName] = useState('');
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [raceTo, setRaceTo] = useState('5');
    const [sets, setSets] = useState('1');
    const [breakFormat, setBreakFormat] = useState<"Winner Breaks" | "Alternate Breaks">('Winner Breaks');
    const [breakMethod, setBreakMethod] = useState<'random' | 'lag'>('random');

    const [lagPopup, setLagPopup] = useState(false);
    const [lagWinnerSelected, setLagWinnerSelected] = useState<'player1' | 'player2' | null>(null);

    const [user, setUser] = useState<any>(null);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (breakMethod === 'lag'){
            setLagPopup(true);
            return;
        }
        
        await submitMatch(null);
    };

    const submitMatch = async (finalLagWinner: string|null) => {
        try {
            const res = await fetch('/api/createMatch10', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameName,
                    player1,
                    player2,
                    raceTo,
                    sets,
                    breakFormat,
                    lagWinner: finalLagWinner,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('API error:', errorData.error);
                return;
            }

            const result = await res.json();
            console.log('Match created:', result);

            router.push('/tracker/10-ball');
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    }

    return (
        <div className="page-box">
            <Header className={`home-title-box ${lagPopup ? "blurred" : ""}`}></Header>
            <div className={`select-box ${lagPopup ? "blurred" : ""}`}>
                <form onSubmit={handleSubmit}>
                    <p className="game-name-message">What would your legendary 10-ball game name be today?</p>
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
                            <label className="race-label">Race to:</label>
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

                        <div className="sets-box">
                            <label className="sets-label">Race to Sets:</label>
                            <input
                                className="sets-input"
                                type="text"
                                inputMode="numeric"
                                pattern="^[1-9][0-9]*$"
                                value={sets}
                                onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                    setSets(val);
                                }
                                }}
                                required
                                title="Please enter a number greater than 0."
                            />
                        </div>
                    </div>


                    <div className="break-box">
                        <label className="break-label">Break Format:</label>
                        <div className="break-format-box">
                            <label className="break-format-text">
                                <input type="radio" name="break" value="Winner Breaks" checked={breakFormat === "Winner Breaks"} 
                                onChange={() => setBreakFormat("Winner Breaks")} /> Winner Breaks 
                            </label>
                            <label className="break-format-text">
                                <input type="radio" name="break" value="Alternate Breaks" checked={breakFormat === "Alternate Breaks"} 
                                onChange={() => setBreakFormat("Alternate Breaks")} /> Alternate Breaks
                            </label>
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
                <div className="modal-overlay">
                    <div className="modal-content">
                    <p className="lag-text">Players, lag for break at this time.</p>
                    <p className="lag-winner-text">Pick a lag winner:</p>
                    <div className="lag-button-box">
                        <button className={`player1-lag-button ${lagWinnerSelected === 'player1' ? 'active-red' : ''}`} onClick={() => setLagWinnerSelected('player1')}>
                        {player1 || 'player1'}
                        </button>
                        <button className={`player2-lag-button ${lagWinnerSelected === 'player2' ? 'active-blue' : ''}`} onClick={() => setLagWinnerSelected('player2')}>
                        {player2 || 'player2'}
                        </button>
                    </div>
                    <button className="continue-button" disabled={!lagWinnerSelected} onClick={() => {
                        setLagPopup(false);
                        const lagName = lagWinnerSelected === 'player1' ? player1 : player2;
                        submitMatch(lagName);
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
