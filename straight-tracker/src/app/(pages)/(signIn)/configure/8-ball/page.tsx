"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '@/src/components/Header';

const Select: React.FC = () => {
    const router = useRouter();

    const searchParams = useSearchParams();
    let matchID = searchParams.get('matchID');
    const [gameName, setGameName] = useState('');
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [raceTo, setRaceTo] = useState('5');
    const [sets, setSets] = useState('');
    const [oldSets, setOldSets] = useState('');
    const [enableSets, setEnableSets] = useState(false);
    const [oddWarning, setOddWarning] = useState('');
    const [raceWarning, setRaceWarning] = useState('');
    const [breakFormat, setBreakFormat] = useState<"Winner Breaks" | "Alternate Breaks">();

    const [lagPopup, setLagPopup] = useState(false);
    const [lagWinnerSelected, setLagWinnerSelected] = useState<'player1' | 'player2' | null>(null);

    const [id, setId] = useState<number>();

    const [toBreak, setToBreak] = useState('');
    const [player1Score, setPlayer1Score] = useState<number>(0);
    const [player2Score, setPlayer2Score] = useState<number>(0);

    const raceSets = parseInt(sets) !== undefined ? Math.floor(parseInt(sets) / 2) + 1 : null; //Converts best of to race to (sets)
    const [player1Set, setPlayer1Set] = useState<number | undefined>();
    const [player2Set, setPlayer2Set] = useState<number | undefined>();

    const [showWinnerVerificationModal, setShowWinnerVerificationModal] = useState(false);
    const [playerToWin, setPlayerToWin] = useState('');
    const [playerToWinScore, setPlayerToWinScore] = useState<number | undefined>(0);
    const [playerToWinSets, setPlayerToWinSets] = useState<number | undefined>(0);
    const [isOpen, setIsOpen] = useState(false);
    const [winner, setWinner] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const toggleDropdown = () => setIsOpen(!isOpen);
    
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
                    setOldSets(val);
                }
            }
        }
    };
    
    const handleToggleSets = (checked: boolean) => {
        setEnableSets(checked);
        console.log(oldSets);
        if (checked){
            setSets(oldSets);
        }   
        else{
            setSets('');
        }
    };

    const handleNewRace = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;


        if (/^\d*$/.test(val)) {
            setRaceTo(val);
            
            if (val === ''){
                setRaceWarning('Please enter a number greater than 0.');
            } 
            else{
                const num = parseInt(val);
                const minRaceVal = Math.max(player1Score, player2Score) + 1;
                if (num < minRaceVal){
                    setRaceWarning(`New race to value too small.  Minimum value is ${minRaceVal}`);
                } else {
                    setRaceWarning('');
                }
            }
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

        if (raceWarning){
            toast.error(raceWarning, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
        
        await updateMatchConfig(null);
    };

    const updateMatchConfig = async (finalLagWinner: string|null) => {
        try {
            if (!matchID) return;

            const res = await fetch(`/api/updateMatchConfiguration?matchID=${matchID}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game_type: 0,
                    game_name: gameName,
                    player1: player1,
                    player2: player2,
                    race_to: parseInt(raceTo),
                    break_format: breakFormat == "Winner Breaks" ? 0 : 1,
                    lag_winner: finalLagWinner,
                    to_break: toBreak,
                    enableSets: enableSets,
                    sets: sets ? parseInt(sets) : null,
                }),
            });

            if (!res.ok) {
                const { type, error } = await res.json();
                if (type === 'validation_error') {
                    console.warn('Validation failed:', error);
                    toast.error(error, {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                    });
                    return;
                } else {
                    console.error('API error:', error);
                    return;
                }
            }

            router.push(`/tracker/8-ball?matchID=${matchID}`);
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    }

    const handleWinner = async (winnerValue: string) => { //Updates winner when score matches requirement
        setWinner(winnerValue);
        setLoading(true);
        try{
            const res = await fetch('/api/updateWinner',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    matchID,
                    winner: winnerValue,
                }),
            })

            const data = await res.json();
            if (!res.ok){
                setError(data.error || 'Failed to update winner');
            } 
            else{
                console.log('Success:', data.message);
            }
        } 
        catch (err){
            setError('Error contacting server');
        } 
        finally{
            setLoading(false);
        }
    }

    const handleExit = () => {
        const winnerValue = playerToWin;
        handleWinner(winnerValue);
        router.push('/history');
    }

    const handleReturnToTracker = () => {
        router.push(`/tracker/8-ball?matchID=${matchID}`);
    }

    useEffect(() => { //Get match info
        const fetchMatch = async () => {
            try{
                if (!matchID) return;
                const res = await fetch(`/api/getPoolMatch?matchID=${matchID}`);
                const json = await res.json();

                setGameName(json.poolMatch.game_name);
                setPlayer1(json.poolMatch.player1);
                setPlayer2(json.poolMatch.player2);
                setRaceTo(json.poolMatch.race_to);
                setBreakFormat(json.poolMatch.break_format == 0 ? "Winner Breaks" : "Alternate Breaks");
                setToBreak(json.poolMatch.to_break);
                
                const raceCount = json.matchRace.length;
                setId(json.matchRace[raceCount-1].id);
                setPlayer1Score(json.matchRace[raceCount-1].player1_score); 
                setPlayer2Score(json.matchRace[raceCount-1].player2_score);

                const setsEnabled = json.matchSets.sets !== undefined;
                handleToggleSets(setsEnabled)

                if (setsEnabled) {
                    const p1SetWins = json.matchRace.filter((set: any) => set.winner === /* json.poolMatch.player1 */ "player1").length;
                    const p2SetWins = json.matchRace.filter((set: any) => set.winner === /* json.poolMatch.player2 */ "player2").length;

                    setPlayer1Set(p1SetWins);
                    setPlayer2Set(p2SetWins);
                } else {
                    setPlayer1Set(undefined);
                    setPlayer2Set(undefined);
                } 
                
                setSets(json.matchSets.sets || undefined); //Load sets last: this prevents rendering inconsistencies.
                if(json.matchSets.sets)
                    setOldSets(json.matchSets.sets);
            }
            catch (err){
                setError('Error');
            }
            finally{
                setLoading(false);
            };
        }
        fetchMatch();
    }, [matchID]);

    if(loading) { //Loading screen
        return (
            <div className="page-box">
                <div className="loading-screen">
                    <Header/>
                    <div className="loading-content">
                        <p>Loading match configuration...</p>
                        <img src="/spinner.gif" className="spinner-css" alt="Loading..."></img>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="select-page-box">
            <Header className={`home-title-box ${lagPopup ? "blurred" : ""}`}></Header>
            <ToastContainer/>
            <div className={`select-box ${lagPopup ? "blurred" : ""}`}>
                <button className="submit-button" onClick={handleReturnToTracker}>back</button>
                <form onSubmit={handleSubmit}>
                    <p className="game-name-message">Game name:</p>
                    <input className="game-name-input" type="text" placeholder="Game Name (optional)" value={gameName} onChange={(e) => setGameName(e.target.value)} />
                    
                    <img src="/divider.png" className="divider-css"></img>

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
                                onChange={handleNewRace}
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
                                <button className="sets-icon">i</button>
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
                    
                    <hr className="styled-divider" />
                    <div className="dropdown-component">
                        <div className="dropdown-container" onClick={toggleDropdown}>
                            <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>&#9660;</span>
                            <span className="dropdown-text">Declare Winner</span>
                        </div>

                        <div>
                            {isOpen && (
                                <div>
                                    <div className="button-selection-box">
                                        <button type="button" className="submit-button" onClick={() => {
                                            setShowWinnerVerificationModal(true);
                                            setPlayerToWin(player1);
                                            setPlayerToWinScore(player1Score);
                                            if(raceSets) setPlayerToWinSets(player1Set);
                                        }}>
                                            {player1}
                                        </button>
                                        <button type="button" className="submit-button" onClick={() => {setShowWinnerVerificationModal(true); setPlayerToWin(player2); setPlayerToWinScore(player2Score);}}>
                                            {player2}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="button-selection-box">
                        <button type="submit" className="submit-button">Update Match</button>
                    </div>
                </form>
            </div>
        {showWinnerVerificationModal && (
            <div className="details-modal-overlay" onClick={() => setShowWinnerVerificationModal(false)}>
                <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
                    <p className="game-name-message">Are you sure you want to make {playerToWin} the winner? They have a score of {playerToWinScore}{raceSets && playerToWinSets != null ? ` and won ${playerToWinSets} sets` : ''}.</p>
                    <div className="button-selection-box">
                        <button type="button" className="submit-button" onClick={() => {handleExit()}}>
                            Yes
                        </button>
                        <button type="button" className="submit-button" onClick={() => {setShowWinnerVerificationModal(false)}}>
                            No
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    )
}

export default Select;
