"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import Icon from '@mdi/react';
import { mdiCog } from '@mdi/js';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Loading from '@/src/components/PageLoading'

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
    const [breakFormat, setBreakFormat] = useState<1|2>();
    const [toBreak, setToBreak] = useState<1|2>(1);
    const [player1Score, setPlayer1Score] = useState<number>(0);
    const [player2Score, setPlayer2Score] = useState<number>(0);

    const [sets, setSets] = useState<number>(); 
    const raceSets = sets !== undefined ? Math.floor(sets / 2) + 1 : null; //Converts best of to race to (sets)
    const [player1Set, setPlayer1Set] = useState<number | undefined>();
    const [player2Set, setPlayer2Set] = useState<number | undefined>();

    const [winner, setWinner] = useState<1|2|null>(null);

    type Action = {
        player: string;
        prevScore: number;
        toBreak: 1|2;
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
                    await completeSet(prev + 1, player2Score, toBreak, 1);
                }
                else{
                    await updatePoolMatch(prev + 1, player2Score, toBreak);
                    handleWinner(1);
                }
            }
        }
        else{
            if (prev + 1 === raceTo){
                await updatePoolMatch(prev + 1, player2Score, toBreak);
                handleWinner(1);
            }
        }

        if (breakFormat === 1){
            setToBreak(1);
        } 
        else if (toBreak === 1){
            setToBreak(2);
        } 
        else{
            setToBreak(1);
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
                    await completeSet(player1Score, prev + 1, toBreak, 2);
                }
                else{
                    await updatePoolMatch(player1Score, prev + 1, toBreak);
                    handleWinner(2);
                }
            }
        }
        else{
            if (prev + 1 === raceTo){
                await updatePoolMatch(player1Score, prev + 1, toBreak);
                handleWinner(2);
            }
        }

        if (breakFormat === 1){
            setToBreak(2);
        } 
        else if (toBreak === 1){
            setToBreak(2);
        } 
        else{
            setToBreak(1);
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

    const updatePoolMatch = async (updatedPlayer1Score: number, updatedPlayer2Score: number, toBreak: number, winner?: 1 | 2 | null) => { //updates scores to database
        try {
            const res = await fetch('/api/updatePoolMatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    match_id: matchID,
                    id,
                    player1_score: updatedPlayer1Score,
                    player2_score: updatedPlayer2Score,
                    to_break: toBreak,
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

    const completeSet = async (finalPlayer1Score: number, finalPlayer2Score: number, toBreak: 1 | 2, winner: 1 | 2) => { //creates a new set when a player reaches the race_to requirement
        try{
            setLoading(true);
            await updatePoolMatch(finalPlayer1Score, finalPlayer2Score, toBreak, winner);

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
    
    const handleWinner = async (winnerValue: 1 | 2 | null) => { //Updates winner when score matches requirement
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
        await updatePoolMatch(player1Score, player2Score, toBreak);

        router.push(`/configure/pool-games?matchID=${matchID}`);
    }

    const handleExit = () => {
        const winnerValue = winner;
        handleWinner(winnerValue);
        router.push('/history');
    }

    useEffect(() => { //Toastify notification on match updated successfully
        if (loading) return;

        const success = searchParams.get('success');
        if (success === '1') {
            setTimeout(() => {
                toast.success("Match config updated successfully.", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            }, 0);

            const params = new URLSearchParams(searchParams.toString());
            params.delete('success');
            router.replace(`${pathname}?${params.toString()}`);
        }
    }, [loading]);

    useEffect(() => { //Get match info
        const fetchMatch = async () => {
            try{
                const res = await fetch(`/api/getPoolMatch?matchID=${matchID}`);
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
        if (!matchID || !id) return;

        const interval = setInterval(() => {
            updatePoolMatch(player1Score, player2Score, toBreak);
        }, 15000);

        return () => clearInterval(interval);
    }, [matchID, id, player1Score, player2Score, toBreak]);
    
    useEffect(() => { //Updating database with scores on reload & leaving tab
        if (!matchID || !id) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                const payload = JSON.stringify({
                    match_id: matchID,
                    id,
                    player1_score: player1Score,
                    player2_score: player2Score,
                    to_break: toBreak,
                });

                const blob = new Blob([payload], { type: 'application/json' });

                navigator.sendBeacon('/api/updatePoolMatch', blob);
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [matchID, id, player1Score, player2Score, toBreak]);

    useEffect(() => { //Updating database with scores when page is unloaded
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            navigator.sendBeacon('/api/updatePoolMatch', JSON.stringify({
                match_id: matchID,
                player1_score: player1Score,
                player2_score: player2Score,
                to_break: toBreak,
                winner: winner ?? null
            }));
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [matchID, id, player1Score, player2Score, toBreak]);


    if (loading){
        return <Loading/>;
    }

    return (
        <div className="tracker-page-container">
            <ToastContainer className="s-toast-warning"/>
            <button className="tracker-gear-button" onClick={handleConfigureGame} title="Configure Match">
                <Icon path={mdiCog} size={1} />
            </button>
            
            <p className="tracker-game-name-text">
                {gameName}  
            </p>
            
            <div className="tracker-race-sets-container">
                <p className="tracker-race-text">Race to {raceTo}</p>
                {sets && (
                    <>
                        <p>-</p>
                        <p className="tracker-sets-text">Best of {sets} Sets</p>
                    </>
                )}
            </div>
            
            <div className="tracker-rack-container">
                <p className="tracker-rack-text bracket">
                    (
                </p>
                        
                <div className="tracker-rack-text-container">
                    {sets !== undefined && (
                        <>
                            <p className="tracker-rack-text">
                                Set {player1Set !== undefined && player2Set !== undefined ? player1Set + player2Set + 1: 1}
                            </p>

                            <p>
                                -
                            </p>
                        </>
                    )}
                    
                    <p className="tracker-rack-text">
                        Rack {player1Score + player2Score + 1}
                    </p>
                </div>

                <p className="tracker-rack-text bracket">
                    )
                </p>
            </div>

            <div className="tracker-to-break-container">
                <p className="tracker-to-break-player-text">
                    {toBreak === 1 ? `${player1}` : `${player2}`}
                </p>
                
                <p className="tracker-to-break-text">
                    to break!
                </p>
            </div>


            <img src="/divider.png" className="tracker-divider-css"></img>
            
            <div className="tracker-score-container">
                    <div className="tracker-player1-container">
                        <p className="tracker-player1-name-text">
                            {player1}
                        </p>

                        <div className="tracker-player1-score-container">
                            <p className="tracker-player-score-text player1">
                                {player1Score}
                            </p>
                            <button className="tracker-player1-increment" onClick={incrementPlayer1}>
                                +
                            </button>
                        </div>

                        {sets && (
                            <div className="tracker-player1-sets-container">
                                <p className="tracker-player-set-text player1">
                                    {player1Set}
                                </p>
                                <p className="tracker-player-set-label">
                                    Sets
                                </p>
                            </div>
                        )}    
                    </div>
                    
                    <button className="tracker-undo-button" onClick={handleUndo} disabled={actionHistory.length === 0}>Undo</button>

                    <div className="tracker-player2-container">
                        <p className="tracker-player2-name-text">
                            {player2}
                        </p>

                        <div className="tracker-player2-score-container">
                            <p className="tracker-player-score-text player2">
                                {player2Score}
                            </p>
                            <button className="tracker-player2-increment" onClick={incrementPlayer2}>
                                +
                            </button>
                        </div>

                        {sets && (
                            <div className="tracker-player2-sets-container">
                                <p className="tracker-player-set-text player2">
                                    {player2Set}
                                </p>
                                <p className="tracker-player-set-label">
                                    Sets
                                </p>
                            </div>
                        )}
                    </div>
            </div>
            

            {winner && (
                <div className="tracker-winner-modal">
                    <div className="tracker-winner-modal-content">
                        <p className="tracker-winner-title-text">
                            And the winner is...
                        </p>
                        <p className="tracker-winner-text">
                            {winner === 1
                                ? player1 === 'Player1'
                                ? 'Player 1'
                                : `Player 1 - ${player1}`
                            : winner === 2
                                ? player2 === 'Player2'
                                ? 'Player 2'
                                : `Player 2 - ${player2}`
                                : ''}
                        </p>
                        <div className="tracker-winner-button-container">
                            <button className="tracker-winner-button" onClick={handleExit}>
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