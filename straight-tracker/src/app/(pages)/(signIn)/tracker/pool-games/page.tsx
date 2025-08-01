"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '@/src/components/Header';

const Tracker: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const matchID = searchParams.get('matchID');
    const [id, setId] = useState<number>();
    const [gameName, setGameName] = useState('');
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [raceTo, setRaceTo] = useState<number>();
    const [breakFormat, setBreakFormat] = useState(0);
    const [toBreak, setToBreak] = useState('');
    const [player1Score, setPlayer1Score] = useState<number>(0);
    const [player2Score, setPlayer2Score] = useState<number>(0);

    const [sets, setSets] = useState<number>(); 
    const raceSets = sets !== undefined ? Math.floor(sets / 2) + 1 : null; //Converts best of to race to (sets)
    const [player1Set, setPlayer1Set] = useState<number | undefined>();
    const [player2Set, setPlayer2Set] = useState<number | undefined>();

    const [winner, setWinner] = useState('');

    type Action = {
        player: string;
        prevScore: number;
        toBreak: string;
        prevSet?: number;
        prevRaceId?: number;
    };
    
    const [actionHistory, setActionHistory] = useState<Action[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const incrementPlayer1 = async () => { //Increment player1 score, updates who to break
        const prev = player1Score;
        const currentToBreak = toBreak;

        setPlayer1Score(prev + 1);

        const isSetsMode = sets != undefined;

        const action: Action = {
            player: 'player1',
            prevScore: prev,
            toBreak: currentToBreak,
        };

        if (isSetsMode){
            if (prev + 1 === raceTo && player1Set !== undefined){
                const prevSet = player1Set;
                action.prevSet = player1Set;
                setPlayer1Set(prevSet + 1);

                if (prevSet + 1 !== raceSets){
                    action.prevRaceId = id;
                    await completeSet(prev + 1, player2Score, 'player1');
                }
                else{
                    await updatePoolMatch(prev + 1, player2Score);
                    const winnerValue = player1;
                    handleWinner(winnerValue);
                }
            }
        }
        else{
            if (prev + 1 === raceTo){
                await updatePoolMatch(prev + 1, player2Score);
                const winnerValue = player1;
                handleWinner(winnerValue);
            }
        }

        if (breakFormat === 0){
            setToBreak(player1);
        } 
        else if (toBreak === player1){
            setToBreak(player2);
        } 
        else{
            setToBreak(player1);
        }

        setActionHistory(history => [...history, action]);
    };

    const incrementPlayer2 = async () => { //Increment player2 score, updates who to break
        const prev = player2Score;
        const currentToBreak = toBreak;

        setPlayer2Score(prev + 1);

        const isSetsMode = sets != undefined;

        const action: Action = {
            player: 'player2',
            prevScore: prev,
            toBreak: currentToBreak,
        };

        if (isSetsMode){
            if (prev + 1 === raceTo && player2Set !== undefined){
                const prevSet = player2Set;
                action.prevSet = player2Set;
                setPlayer2Set(prevSet + 1);

                if (prevSet + 1 !== raceSets){
                    action.prevRaceId = id;
                    await completeSet(player1Score, prev + 1, 'player2');
                }
                else{
                    await updatePoolMatch(player1Score, prev + 1);
                    const winnerValue = player2;
                    handleWinner(winnerValue);
                }
            }
        }
        else{
            if (prev + 1 === raceTo){
                await updatePoolMatch(player1Score, prev + 1);
                const winnerValue = player2;
                handleWinner(winnerValue);
            }
        }

        if (breakFormat === 0){
            setToBreak(player2);
        } 
        else if (toBreak === player1){
            setToBreak(player2);
        } 
        else{
            setToBreak(player1);
        }

        setActionHistory(history => [...history, action]);
    };

    const handleUndo = async () => { //Undo button logic
        const lastAction = actionHistory[actionHistory.length - 1];
        if (!lastAction) return;

        if (lastAction.player === 'player1') {
            setPlayer1Score(lastAction.prevScore);

            if (sets !== undefined && raceTo !== undefined && lastAction.prevSet !== undefined && lastAction.prevRaceId !== undefined) {
                setLoading(true);
                setPlayer1Set(lastAction.prevSet);
                
                await fetch(`/api/deleteRace?raceID=${id}`, {
                    method: 'DELETE',
                });

                const res = await fetch(`/api/getRaceScores?raceID=${lastAction.prevRaceId}`);
                const json = await res.json();
                
                if (res.ok){
                    setId(lastAction.prevRaceId);
                    setPlayer1Score(json.player1Score-1);
                    setPlayer2Score(json.player2Score);
                }
                else{
                    console.error('Failed to retrieve previous race score:', json.error);
                }
                setLoading(false);
            }
        } 
        else if (lastAction.player === 'player2') {
            setPlayer2Score(lastAction.prevScore);

            if (sets !== undefined && raceTo !== undefined && lastAction.prevSet !== undefined && lastAction.prevRaceId !== undefined) {
                setLoading(true);
                setPlayer2Set(lastAction.prevSet);
                
                await fetch(`/api/deleteRace?raceID=${id}`, {
                    method: 'DELETE',
                });

                const res = await fetch(`/api/getRaceScores?raceID=${lastAction.prevRaceId}`);
                const json = await res.json();
                
                if (res.ok){
                    setId(lastAction.prevRaceId);
                    setPlayer1Score(json.player1Score);
                    setPlayer2Score(json.player2Score-1);
                }
                else{
                    console.error('Failed to retrieve previous race score:', json.error);
                }
                setLoading(false);
            }
        }

        setToBreak(lastAction.toBreak);
        setActionHistory(prev => prev.slice(0, -1));
    };

    const updatePoolMatch = async (updatedPlayer1Score: number, updatedPlayer2Score: number, winner?: 'player1' | 'player2' | null) => { //updates scores to database
        try {
            const res = await fetch('/api/updatePoolMatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    player1_score: updatedPlayer1Score,
                    player2_score: updatedPlayer2Score,
                    winner: winner ?? null
                }),
            });

            const data = await res.json();
            if (data.error) {
                console.error('Failed to update match:', data.error);
            }
        } catch (err) {
            console.error('Error updating match:', err);
        }
    };

    const completeSet = async (finalPlayer1Score: number, finalPlayer2Score: number, winner: 'player1' | 'player2') => { //creates a new set when a player reaches the race_to requirement
        try{
            setLoading(true);
            await updatePoolMatch(finalPlayer1Score, finalPlayer2Score, winner);

            const res = await fetch(`/api/createNewRace?matchID=${matchID}`, {
                method: 'POST',
            });

            const json = await res.json();

            if (!res.ok) {
                console.error('API error:', json.error);
                return;
            }

            setPlayer1Score(0);
            setPlayer2Score(0);

            const newRaceID = json.newRace?.[0]?.id;
            setId(newRaceID);
            setLoading(false);
        } 
        catch (err){
            console.error('Failed to create new set', err);
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

    const handleConfigureGame = async () => {
        await updatePoolMatch(player1Score, player2Score);

        router.push(`/configure/pool-games?matchID=${matchID}`);
    }

    const goToHistory = async () => {
        await updatePoolMatch(player1Score, player2Score);

        router.push('/history');
    }

    const handleExit = () => {
        const winnerValue = winner;
        handleWinner(winnerValue);
        router.push('/history');
    }

    useEffect(() => { //Toastify notification on configuring match success
        const params = new URLSearchParams(window.location.search);

        if (params.get('success') === '1') {
            toast.success("Match config updated successfully.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });

            params.delete('success');
            router.replace(`${window.location.pathname}?${params.toString()}`);
        }
    }, [])

    useEffect(() => { //Get match info
        const fetchMatch = async () => {
            try{
                const segments = pathname.split('/');
                const URLGameType = segments[2]; 
                const URLGameTypeNumber = URLGameType?.split('-')[0];

                const res = await fetch(`/api/getPoolMatch?matchID=${matchID}&gameType=${parseInt(URLGameTypeNumber)}`);
                const json = await res.json();
                
                if (json.redirect) {
                    router.push(json.redirect);
                    return;
                }

                setGameName(json.poolMatch.game_name);
                setPlayer1(json.poolMatch.player1);
                setPlayer2(json.poolMatch.player2);
                setRaceTo(json.poolMatch.race_to);
                setBreakFormat(json.poolMatch.break_format);
                setToBreak(json.poolMatch.to_break);
                
                const raceCount = json.matchRace.length;
                setId(json.matchRace[raceCount-1].id);
                setPlayer1Score(json.matchRace[raceCount-1].player1_score); 
                setPlayer2Score(json.matchRace[raceCount-1].player2_score);

                const setsEnabled = json.matchSets.sets !== undefined;

                if (setsEnabled) {
                    const p1SetWins = json.matchRace.filter((set: any) => set.winner === "player1").length;
                    const p2SetWins = json.matchRace.filter((set: any) => set.winner === "player2").length;

                    setPlayer1Set(p1SetWins);
                    setPlayer2Set(p2SetWins);
                } else {
                    setPlayer1Set(undefined);
                    setPlayer2Set(undefined);
                } 
                
                setSets(json.matchSets.sets || undefined); //Load sets last: this prevents rendering inconsistencies.
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

    useEffect(() => { //Updating database with scores every 15 seconds
        if (!id) return;

        const interval = setInterval(() => {
            updatePoolMatch(player1Score, player2Score);
        }, 15000);

        return () => clearInterval(interval);
    }, [id, player1Score, player2Score]);
    
    useEffect(() => { //Updating database with scores on reload & leaving tab
        if (!id) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                const payload = JSON.stringify({
                    id,
                    player1_score: player1Score,
                    player2_score: player2Score,
                });

                const blob = new Blob([payload], { type: 'application/json' });

                navigator.sendBeacon('/api/updatePoolMatch', blob);
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [id, player1Score, player2Score]);


    return (
        <div className="tracker-page-box">
            <ToastContainer className="s-toast-warning"/>
            <Header></Header>
    
            {loading && (
                <div className="page-box">
                    <div className="loading-screen">
                        <div className="loading-content">
                            <p>Loading match info...</p>
                            <img src="/spinner.gif" className="spinner-css" alt="Loading..."></img>
                        </div>
                    </div>
                </div>
            )}

            {!loading && (
                <div className="tracker-box">
                    <div className="game-name-box">
                        <div className="hamburger-container">
                            <img src="/hamburger-menu.png" className="hamburger-icon"/>
                            <div className="dropdown-menu">
                                <div className="dropdown-item" onClick={handleConfigureGame}>Configure Match</div>
                                <div className="dropdown-item" onClick={goToHistory}>Go to History</div>
                            </div>
                        </div>
                        <p className="game-name-text">
                            {gameName}  
                        </p>
                    </div>
                    
                    <div className="race-text-box">
                        <p className="race-text">Race to {raceTo}</p>
                        {sets && (
                            <div className="race-text-box">
                                <p className="race-text">-</p>
                                <p className="race-text">Best of {sets} Sets</p>
                            </div>
                        )}
                    </div>
                    
                    
                    <div className="rack-box">
                        <p className="rack-text">
                            (
                        </p>
                        {sets !== undefined && (
                            <div className="rack-box">
                                <p className="rack-text">
                                    Set {player1Set !== undefined && player2Set !== undefined ? player1Set + player2Set + 1: 1}
                                </p>

                                <p className="rack-text">
                                    -
                                </p>
                            </div>
                        )}
                        
                        <p className="rack-text">
                            Rack {player1Score + player2Score + 1}
                        </p>

                        <p className="rack-text">
                            )
                        </p>
                    </div>

                    <img src="/divider.png" className="tracker-divider-css"></img>

                    <div className="to-break-box">
                        <p className="to-break-player-text">
                            {toBreak}
                        </p>
                        
                        <p className="to-break-text">
                            to break!
                        </p>
                    </div>
                    
                    
                    <div className="score-box">
                        <div className="player1-box">
                            <p className="player1-text">
                                {player1}
                            </p>

                            <div className="player1-score-box">
                                <p className="player1-score">
                                    {player1Score}
                                </p>
                                <button className="player1-increment" onClick={incrementPlayer1}>
                                    +
                                </button>
                            </div>

                            {sets && (
                                <div className="player1-sets-box">
                                    <p className="player1-set">
                                        {player1Set}
                                    </p>
                                    <p className="player1-set-text">
                                        Sets
                                    </p>
                                </div>
                            )}    
                        </div>

                        <div className="player2-box">
                            <p className="player2-text">
                                {player2}
                            </p>

                            <div className="player2-score-box">
                                <p className="player2-score">
                                    {player2Score}
                                </p>
                                <button className="player2-increment" onClick={incrementPlayer2}>
                                    +
                                </button>
                            </div>

                            {sets && (
                                <div className="player2-sets-box">
                                    <p className="player2-set">
                                        {player2Set}
                                    </p>
                                    <p className="player2-set-text"> 
                                        Sets
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                

                    <div className={sets ? 'undo-set-box' : 'undo-box'}>
                        <button className="undo-style" onClick={handleUndo} disabled={actionHistory.length === 0}>Undo</button>
                    </div>
                </div>     
            )}

            {winner && (
                <div className="winner-modal">
                    <div className="winner-content-modal">
                        <p className="winner-notice-text">
                            And the winner is...
                        </p>
                        <p className="winner-text">
                            {winner}
                        </p>
                        <div className="winner-button-box">
                            <button className="winner-button" onClick={handleExit}>
                                exit match
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Tracker