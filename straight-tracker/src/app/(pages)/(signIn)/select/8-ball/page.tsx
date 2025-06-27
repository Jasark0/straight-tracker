"use client";

import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import Header from '@/src/components/Header';

const Select: React.FC = () => {
    const router = useRouter();

    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [raceTo, setRaceTo] = useState(5);
    const [sets, setSets] = useState(1);
    const [breakOrder, setBreakOrder] = useState<"Winner Breaks" | "Alternate Breaks">('Winner Breaks');
    const [lagWinner, setLagWinner] = useState<'random' | 'lag'>('random');

    const handleSubmit = () => {
        const config = {
            player1,
            player2,
            raceTo,
            sets,
            breakOrder,
            lagWinner,
        };

        console.log("Match Config:", config);
    };

    return (
        <div className="page-box">
            <Header/>
            <div className="select-box">
                <p className="tracker-title-css">Welcome to 8-Ball Score Tracker</p>

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
                        <input className="race-input" type="number" value={raceTo} onChange={(e) => setRaceTo(Number(e.target.value))}/>
                    </div>

                    <div className="sets-box">
                        <label className="sets-label">Sets:</label>
                        <input className="sets-input" type="number" value={sets} onChange={(e) => setSets(Number(e.target.value))}/>
                    </div>
                </div>


                <div className="break-box">
                    <label className="break-label">Break Format:</label>
                    <div className="break-format-box">
                        <label className="break-format-text">
                            <input type="radio" name="break" value="Winner Breaks" checked={breakOrder === "Winner Breaks"} 
                            onChange={() => setBreakOrder("Winner Breaks")} /> Winner Breaks 
                        </label>
                        <label className="break-format-text">
                            <input type="radio" name="break" value="Alternate Breaks" checked={breakOrder === "Alternate Breaks"} 
                            onChange={() => setBreakOrder("Alternate Breaks")} /> Alternate Breaks
                        </label>
                    </div>
                </div>

                <div className="lag-box">
                    <label className="lag-label">Who breaks first?</label>
                    <div className="break-method-box">
                        <label>
                            <input type="radio" name="breakMethod" value="random" checked={lagWinner === 'random'}
                            onChange={() => setLagWinner('random')}/>
                            Randomize
                        </label>
                        <label>
                            <input type="radio" name="breakMethod" value="lag" checked={lagWinner === 'lag'}
                            onChange={() => setLagWinner('lag')}/>
                            Lag for Break
                        </label>
                    </div>
                </div>

                <button className="submit-button" onClick={handleSubmit}>Start Match</button>
            </div>
        </div>
    )
}

export default Select;
