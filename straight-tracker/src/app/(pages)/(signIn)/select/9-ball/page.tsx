"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Select: React.FC = () => {
    const router = useRouter();

    const [gameName, setGameName] = useState('');
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [raceTo, setRaceTo] = useState('5');
    const [sets, setSets] = useState('');
    const [enableSets, setEnableSets] = useState(false);
    const [oddWarning, setOddWarning] = useState('');
    const [breakFormat, setBreakFormat] = useState<"Winner Breaks" | "Alternate Breaks">('Winner Breaks');
    const [breakMethod, setBreakMethod] = useState<'random' | 'lag'>('random');

    const [lagPopup, setLagPopup] = useState(false);
    const [lagWinnerSelected, setLagWinnerSelected] = useState<'player1' | 'player2' | null>(null);
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (/^\d*$/.test(val)) {
            setSets(val);
            
            if (val === ''){
                setOddWarning('');
            } 
            else{
                const num = parseInt(val, 10);
                if (num <= 0){
                    setOddWarning('Please enter a number greater than 0.');
                } 
                else if (num % 2 === 0){
                    setOddWarning('Only odd numbers are allowed (1, 3, 5, ...).');
                } 
                else{
                    setOddWarning('');
                }
            }
        }
    };
    
    const handleToggleSets = (checked: boolean) => {
        setEnableSets(checked);
        if (checked){
            setSets('3');
        }   
        else{
            setSets('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (oddWarning){
            toast.error('Fix the Best of (Sets): input.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }

        if (breakMethod === 'lag'){
            setLagPopup(true);
            return;
        }
        
        await submitMatch(null);
    };

    const submitMatch = async (finalLagWinner: string|null) => {
        try {
            const res = await fetch('/api/createPoolMatch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game_type: 1,
                    game_name: gameName,
                    player1: player1,
                    player2: player2,
                    race_to: raceTo,
                    break_format: breakFormat,
                    lag_winner: finalLagWinner,
                    sets: sets ? parseInt(sets) : null,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('API error:', errorData.error);
                return;
            }

            const result = await res.json();

            router.push(`/tracker/pool-games?matchID=${result.match_id}`);
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    }

    useEffect(() => {
        const fetchNickname = async () => {
            try{
                const res = await fetch('/api/getNickname');
                const json = await res.json();

                if (!res.ok){
                    setError(json.error);
                }
                
                setPlayer1(json.nickname);
                setIsLoading(false);
            }
            catch (err){
                setError('Network error');
                console.error(err);
            }
        }
        fetchNickname();
    }, []);

    return !isLoading && (
        <div className="select-page-box">
            <ToastContainer/>
            <div className={`select-box ${lagPopup ? "blurred" : ""}`}>
                <form onSubmit={handleSubmit}>
                    <p className="game-name-message">What would your legendary 9-ball game name be today?</p>
                    <input className="game-name-input" type="text" placeholder="Game Name (optional)" value={gameName} onChange={(e) => setGameName(e.target.value)} />
                    
                    <img src="/divider.png" className="divider-css"></img>

                    <div className="names-selection-message">   
                        <p className="names-message">Players, Type Your Names.</p>
                    </div>

                    <div className="names-selection-box">
                        <div className="player-names">
                            <label className="player-names-label">Player 1:</label>
                            <input className="player-names-input" type="text" placeholder="Type your name" value={player1} onChange={(e) => setPlayer1(e.target.value)}/>
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
                            <label className="sets-toggle-label">
                            <input
                                type="checkbox"
                                checked={enableSets}
                                onChange={(e) => handleToggleSets(e.target.checked)}
                            />
                                Enable Sets
                            </label>
                        </div>
                        
                        {enableSets && (
                            <div className="sets-box">
                            <div className="sets-info-box">
                                <label className="sets-label">Best of (Sets):</label>
                                <button type="button" className="sets-icon">i</button>
                            </div>

                            <div className="sets-info-box">
                                <input
                                className="sets-input"
                                type="text"
                                inputMode="numeric"
                                pattern="^\d*$"
                                value={sets}
                                onChange={handleChange}
                                required
                                title="Please enter a positive odd number greater than or equal to 3."
                                />
                            </div>

                            {oddWarning && <p className="warning-css">{oddWarning}</p>}
                            </div>
                        )}
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
                <div className="modal-overlay" onClick={() => {setLagPopup(false)}}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <p className="lag-text">Players, lag for break at this time.</p>
                        <p className="lag-winner-text">Pick a lag winner:</p>
                        <div className="lag-button-box">
                            <button className={`player1-lag-button ${ lagWinnerSelected === 'player1' ? 'active-red' : ''}`} onClick={() => setLagWinnerSelected('player1')}>
                                {player1 || 'Player1'}
                            </button>
                                
                            <button className={`player2-lag-button ${lagWinnerSelected === 'player2' ? 'active-blue' : ''}`} onClick={() => setLagWinnerSelected('player2')}>
                                {player2 || 'Player2'}
                            </button>
                        </div>

                        <button className="continue-button" disabled={!lagWinnerSelected}
                            onClick={() => {
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
