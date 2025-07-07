"use client";

import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getUserSession } from '@/actions/auth';
import { useSearchParams } from 'next/navigation';

import Header from '@/src/components/Header';

const Tracker: React.FC = () => {
    const router = useRouter();

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
        resetScore?: boolean;
    };
    const [actionHistory, setActionHistory] = useState<Action[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    const incrementPlayer1 = async () => { //Increment player1 score, updates who to break
        const prev = player1Score;
        const currentToBreak = toBreak;

        setPlayer1Score(prev + 1);

        const isSetsMode = sets != undefined;

        if (isSetsMode){
            if (prev + 1 === raceTo && player1Set !== undefined){
                const prevSet = player1Set;
                setPlayer1Set(prevSet + 1);
                
                if (prevSet + 1 !== raceSets){
                    await completeSet(prev + 1, player2Score);
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

        const action: Action = {
            player: 'player1',
            prevScore: prev,
            toBreak: currentToBreak,
        };

        if (isSetsMode){
            action.prevSet = player1Set;
            action.resetScore = prev + 1 === raceTo;
        }

        setActionHistory(history => [...history, action]);
    };

    const incrementPlayer2 = async () => { //Increment player2 score, updates who to break
        const prev = player2Score;
        const currentToBreak = toBreak;

        setPlayer2Score(prev + 1);

        const isSetsMode = sets != undefined;

        if (isSetsMode) {
            if (prev + 1 === raceTo && player2Set !== undefined) {
                const prevSet = player2Set;
                setPlayer2Set(prevSet + 1);

                if (prevSet + 1 !== raceSets){
                    await completeSet(player1Score, prev + 1);
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
            setToBreak(player1);
        } 
        else if (toBreak === player1){
            setToBreak(player2);
        } 
        else{
            setToBreak(player1);
        }

        const action: Action = {
            player: 'player2',
            prevScore: prev,
            toBreak: currentToBreak,
        };

        if (isSetsMode) {
            action.prevSet = player2Set;
            action.resetScore = prev + 1 === raceTo;
        }

        setActionHistory(history => [...history, action]);
    };

    const handleUndo = () => { //Undo button logic
        const lastAction = actionHistory[actionHistory.length - 1];
        if (!lastAction) return;

        if (lastAction.player === 'player1') {
            setPlayer1Score(lastAction.prevScore);

            if (sets !== undefined && lastAction.prevSet !== undefined) {
                setPlayer1Set(lastAction.prevSet);
            }
            if (sets !== undefined && raceTo !== undefined && lastAction.resetScore) {
                setPlayer1Score(raceTo - 1);
            }
        } 
        else if (lastAction.player === 'player2') {
            setPlayer2Score(lastAction.prevScore);

            if (sets !== undefined && lastAction.prevSet !== undefined) {
                setPlayer2Set(lastAction.prevSet);
            }
            if (sets !== undefined && raceTo !== undefined && lastAction.resetScore) {
                setPlayer2Score(raceTo - 1);
            }
        }

        setToBreak(lastAction.toBreak);
        setActionHistory(prev => prev.slice(0, -1));
    };

    const updatePoolMatch = async (updatedPlayer1Score: number, updatedPlayer2Score: number) => { //updates scores to database
        try {
            const res = await fetch('/api/updatePoolMatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    player1Score: updatedPlayer1Score,
                    player2Score: updatedPlayer2Score,
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

    const completeSet = async (finalPlayer1Score: number, finalPlayer2Score: number) => { //creates a new set when a player reaches the race_to requirement
        try{
            await updatePoolMatch(finalPlayer1Score, finalPlayer2Score);

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

    const handleExit = () => {
        const winnerValue = winner;
        handleWinner(winnerValue);
        router.push('/history');
    }

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
                setPlayer1Score(json.matchRace[raceCount-1].player1Score); 
                setPlayer2Score(json.matchRace[raceCount-1].player2Score);

                const setsEnabled = json.matchSets.sets !== undefined;

                if (setsEnabled) {
                    const p1SetWins = json.matchRace.filter((set: any) => set.player1Score === json.poolMatch.race_to).length;
                    const p2SetWins = json.matchRace.filter((set: any) => set.player2Score === json.poolMatch.race_to).length;

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

    useEffect(() => { //Updating database with scores every 30 seconds
        if (!id) return;

        const interval = setInterval(() => {
            updatePoolMatch(player1Score, player2Score);
        }, 30000);

        return () => clearInterval(interval);
    }, [id, player1Score, player2Score]);
    
    useEffect(() => { //Updating database with scores on reload & leaving tab
        if (!id) return;

        const handlePopState = () => {
            updatePoolMatch(player1Score, player2Score);
        };


        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            updatePoolMatch(player1Score, player2Score);
            e.preventDefault();
            e.returnValue = '';
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                updatePoolMatch(player1Score, player2Score);
            }
        };

        window.addEventListener('popstate', handlePopState);
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [id, player1Score, player2Score]);


    if (loading){ //Loading screen
        return (
            <div className="page-box">
                <div className="loading-screen">
                    <Header/>
                    <div className="loading-content">
                        <p>Loading match info...</p>
                        <img src="/spinner.gif" className="spinner-css" alt="Loading..."></img>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="tracker-page-box">
            <Header></Header>
            <div className="tracker-box">
                <div className="game-name-box">
                    <div className="hamburger-container">
                        <img src="/hamburger-menu.png" className="hamburger-icon" />
                        <div className="dropdown-menu">
                            <div className="dropdown-item">Edit Score</div>
                            <div className="dropdown-item">Go to History</div>
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
                            <button className="winner-button">
                                continue match
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>

    )
}

export default Tracker