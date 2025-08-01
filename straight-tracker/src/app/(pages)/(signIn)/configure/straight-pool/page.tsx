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
    const [raceWarning, setRaceWarning] = useState('');
    const [toShoot, setToShoot] = useState('');
    const [lagWinner, setLagWinner] = useState('');

    const [lagPopup, setLagPopup] = useState(false);

    const [id, setId] = useState<number>();

    const [player1Score, setPlayer1Score] = useState<number>(0);
    const [player2Score, setPlayer2Score] = useState<number>(0);


    const [showWinnerVerificationModal, setShowWinnerVerificationModal] = useState(false);
    const [showBackVerificationModal, setShowBackVerificationModal] = useState(false);
    const [playerToWin, setPlayerToWin] = useState('');
    const [playerToWinScore, setPlayerToWinScore] = useState<number | undefined>(0);
    const [isOpen, setIsOpen] = useState(false);
    const [winner, setWinner] = useState('');

    const [oldMatchInfo, setOldMatchInfo] = useState({
        "game_name": "",
        "player1": "",
        "player2": "",
        "race_to": 0,
        "to_shoot": "",
        "lag_winner": "",
        "rack": 1,
        "remaining_balls": 15,
        "player1_score": 0,
        "player1_high_run": 0,
        "player1_curr_run": 0,
        "player2_score": 0,
        "player2_high_run": 0,
        "player2_curr_run": 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const toggleDropdown = () => setIsOpen(!isOpen);

    const [minRaceVal, setMinRaceVal] = useState<number>(1);
    const [playerAheadRace, setPlayerAheadRace] = useState<string>();

    const handleNewRace = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;


        if (/^\d*$/.test(val)) {
            setRaceTo(val);
            
            if (val === ''){
                setRaceWarning('Please enter a number greater than 0.');
            } 
            else{
                const num = parseInt(val);
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

    const updatePlayerName = async (player: number, newName: string) => {
        if(player == 1) {
            if(lagWinner === player1)
                setLagWinner(newName);
            if(toShoot === player1)
                setToShoot(newName);
            setPlayer1(newName);
        } else if(player == 2) {
            if(lagWinner === player2)
                setLagWinner(newName);
            if(toShoot === player2)
                setToShoot(newName);
            setPlayer2(newName);
        }
    }

    const updateMatchConfig = async (finalLagWinner: string|null) => {
        try {
            if (!matchID) return;

            const res = await fetch(`/api/updateStraightMatchConfiguration?matchID=${matchID}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game_name: gameName,
                    player1: player1,
                    player2: player2,
                    race_to: parseInt(raceTo),
                    lag_winner: lagWinner,
                    to_shoot: toShoot
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

            router.push(`/tracker/straight-pool?matchID=${matchID}&success=1`);
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    }

    const handleWinner = async (winnerValue: string) => { //Updates winner when score matches requirement
        setWinner(winnerValue);
        setLoading(true);
        try{
            const res = await fetch('/api/updateStraightWinner',{
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

    const determineShowBackVerification = () => {
        // check to make sure no values have been changed
        if(
            gameName == oldMatchInfo.game_name &&
            player1 == oldMatchInfo.player1 &&
            player2 == oldMatchInfo.player2 &&
            parseInt(raceTo) == oldMatchInfo.race_to) {

            handleReturnToTracker();
            return;
        }
        setShowBackVerificationModal(true);
    }

    const handleReturnToTracker = () => {
        router.push(`/tracker/straight-pool?matchID=${matchID}`);
    }

    useEffect(() => { //Get match info
        const fetchMatch = async () => {
            try{
                if (!matchID) return;
                const res = await fetch(`/api/getStraightMatch?matchID=${matchID}`);
                const json = await res.json();

                setOldMatchInfo(json.straightMatch);

                setGameName(json.straightMatch.game_name);
                setPlayer1(json.straightMatch.player1);
                setPlayer2(json.straightMatch.player2);
                setRaceTo(json.straightMatch.race_to);
                setToShoot(json.straightMatch.to_shoot);
                setLagWinner(json.straightMatch.lag_winner);
                setPlayer1Score(json.straightMatch.player1_score);
                setPlayer2Score(json.straightMatch.player2_score);
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

    useEffect(() => {
        const scoresReady = player1Score !== undefined && player2Score !== undefined;

        if (!scoresReady) return;

        setMinRaceVal(Math.max(player1Score, player2Score) + 1);
        setPlayerAheadRace(player1Score > player2Score ? player1 : player2);
    }, [player1Score, player2Score, player1, player2]);

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
                <button className="submit-button" onClick={() => determineShowBackVerification()}>back</button>
                <form onSubmit={handleSubmit}>
                    <p className="game-name-message">Game name:</p>
                    <input
                        className="game-name-input"
                        type="text"
                        placeholder="Game Name (optional)"
                        value={gameName}
                        onChange={(e) => setGameName(e.target.value)}
                        title="Please enter the name of your legendary straight-pool pool game."
                    />
                    
                    <img src="/divider.png" className="divider-css"></img>

                    <div className="names-selection-box">
                        <div className="player-names">
                            <label className="player-names-label">Player 1:</label>
                            <input
                                className="player-names-input"
                                type="text"
                                placeholder="Type your name"
                                value={player1}
                                onChange={(e) => updatePlayerName(1, e.target.value)}
                                title="Please enter the name of player1."
                            />
                        </div>

                        <div className="player-names">
                            <label className="player-names-label">Player 2:</label>
                            <input
                                className="player-names-input"
                                type="text"
                                placeholder="Type your name"
                                value={player2}
                                onChange={(e) => updatePlayerName(2, e.target.value)}
                                title="Please enter the name of player2."
                            />
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
                                title={`Please enter at least ${minRaceVal} (${playerAheadRace} already made ${minRaceVal - 1} balls).`}
                            />
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
        {showBackVerificationModal && (
        <div className="details-modal-overlay" onClick={() => setShowBackVerificationModal(false)}>
            <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
                <p className="game-name-message">Are you sure you want to leave?  Your changes won't be saved.</p>
                <div className="button-selection-box">
                    <button type="button" className="submit-button" onClick={() => {handleReturnToTracker()}}>
                        Yes
                    </button>
                    <button type="button" className="submit-button" onClick={() => {setShowBackVerificationModal(false)}}>
                        No
                    </button>
                </div>
            </div>
        </div>
        )}
        {showWinnerVerificationModal && (
            <div className="details-modal-overlay" onClick={() => setShowWinnerVerificationModal(false)}>
                <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
                    <p className="game-name-message">Are you sure you want to make {playerToWin} the winner? They have a score of {playerToWinScore}.</p>
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
