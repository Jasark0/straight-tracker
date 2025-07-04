"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { getUserSession } from '@/actions/auth';
import { useSearchParams } from 'next/navigation';

import Header from '@/src/components/Header';

const Tracker: React.FC = () => {
    const router = useRouter();

    const searchParams = useSearchParams();
    const matchID = searchParams.get('matchID');
    const [gameName, setGameName] = useState('');
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [raceTo, setRaceTo] = useState('');
    const [breakFormat, setBreakFormat] = useState(0);
    const [toBreak, setToBreak] = useState('');
    const [player1Score, setPlayer1Score] = useState(0);
    const [player2Score, setPlayer2Score] = useState(0);

    const [sets, setSets] = useState('');
    const [player1Set, setPlayer1Set] = useState();
    const [player2Set, setPlayer2Set] = useState();

    type Action = {
        player: string;
        prevScore: number;
        toBreak: string;
    };
    const [actionHistory, setActionHistory] = useState<Action[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    const incrementPlayer1 = () => { //Increment player1 score, updates who to break
        const prev = player1Score;
        const currentToBreak = toBreak;

        setPlayer1Score(prev + 1);

        if (breakFormat === 0) {
            setToBreak(player1);
        } else if (toBreak === player1) {
            setToBreak(player2);
        } else {
            setToBreak(player1);
        }

        setActionHistory(history => [
            ...history,
            { player: 'player1', prevScore: prev, toBreak: currentToBreak },
        ]);
    };

    const incrementPlayer2 = () => { //Increment player2 score, updates who to break
        const prev = player2Score;
        const currentToBreak = toBreak;

        setPlayer2Score(prev + 1);

        if (breakFormat === 0) {
            setToBreak(player2);
        } else if (toBreak === player1) {
            setToBreak(player2);
        } else {
            setToBreak(player1);
        }

        setActionHistory(history => [
            ...history,
            { player: 'player2', prevScore: prev, toBreak: currentToBreak },
        ]);
    };

    const handleUndo = () => { //Undo button logic
        const lastAction = actionHistory[actionHistory.length - 1];

        if (lastAction.player === 'player1') {
            setPlayer1Score(lastAction.prevScore);
        } else if (lastAction.player === 'player2') {
            setPlayer2Score(lastAction.prevScore);
        }

        setToBreak(lastAction.toBreak);

        setActionHistory(prev => prev.slice(0, -1));
    };



    useEffect(() => { //Get match info
        const fetchMatch = async () => {
            try{
                const res = await fetch(`/api/getMatch8?matchID=${matchID}`);
                const json = await res.json();
                
                if (json.redirect) {
                    router.push(json.redirect);
                    return;
                }

                setGameName(json.match.game_name);
                setPlayer1(json.poolMatch.player1);
                setPlayer2(json.poolMatch.player2);
                setRaceTo(json.poolMatch.race_to);
                setBreakFormat(json.poolMatch.break_format);
                setToBreak(json.poolMatch.to_break);
                setPlayer1Score(json.poolMatch.player1Score);
                setPlayer2Score(json.poolMatch.player2Score);

                setSets(json.matchSets.sets); //Load sets last: this prevents rendering inconsistencies.
                setPlayer1Set(json.matchSets.player1Set);
                setPlayer2Set(json.matchSets.player2Set);
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
        if (!matchID) return;

        const interval = setInterval(() => {
            fetch('/api/updateMatch8', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchID,
                    player1Score,
                    player2Score,
                    player1Set: player1Set,
                    player2Set: player2Set,
                }),
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    console.error('Failed to update match:', data.error);
                }
            })
            .catch(err => console.error('Error updating match:', err));
        }, 30000);

        return () => clearInterval(interval);
    }, [matchID, player1Score, player2Score, player1Set, player2Set]);
    

    useEffect(() => { //Updates database on close or reload page
        if (!matchID) return;

        const saveMatch = () => {
            const data = JSON.stringify({
                matchID,
                player1Score,
                player2Score,
                player1Set,
                player2Set,
            });

            if (navigator.sendBeacon){
                const blob = new Blob([data], { type: 'application/json' });
                navigator.sendBeacon('/api/updateMatch8', blob);
            } 
            else {
                fetch('/api/updateMatch8', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: data,
                    keepalive: true, 
                });
            }
        };

        window.addEventListener('beforeunload', saveMatch);
        window.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                saveMatch();
            }
        });

        return () => {
            window.removeEventListener('beforeunload', saveMatch);
            window.removeEventListener('visibilitychange', saveMatch);
        };
    }, [matchID, player1Score, player2Score, player1Set, player2Set]);

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
                
                {sets && (
                    <p className="set-text">
                        (Set 1)
                    </p>
                )}
                
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
                                    0
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

                        <div className="player1-score-box">
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
                                    0
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
        </div>

    )
}

export default Tracker