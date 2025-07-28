"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Header from '@/src/components/Header';

const Tracker: React.FC = () => {
    const router = useRouter();

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
    };
    
    const [actionHistory, setActionHistory] = useState<Action[]>([]);

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

                if (prevSet + 1 === raceSets){
                    const winnerValue = player1;
                    handleWinner(winnerValue);
                }
            }
        }
        else{
            if (prev + 1 === raceTo){
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

                if (prevSet + 1 === raceSets){
                    const winnerValue = player2;
                    handleWinner(winnerValue);
                }
            }
        }
        else{
            if (prev + 1 === raceTo){
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

            if (sets !== undefined && raceTo !== undefined && lastAction.prevSet !== undefined) {
                setPlayer1Set(lastAction.prevSet);
                
                setPlayer1Score(player1Score-1);
                setPlayer2Score(player2Score);
            }
        } 
        else if (lastAction.player === 'player2') {
            setPlayer2Score(lastAction.prevScore);

            if (sets !== undefined && raceTo !== undefined && lastAction.prevSet !== undefined) {
                setPlayer2Set(lastAction.prevSet);
                
                setPlayer1Score(player1Score);
                setPlayer2Score(player2Score-1);
            }
        }

        setToBreak(lastAction.toBreak);
        setActionHistory(prev => prev.slice(0, -1));
    };
    
    const handleWinner = (winnerValue: string) => { //Updates winner when score matches requirement
        setWinner(winnerValue);
    }

    const handleExit = () => {
        router.push('/');
    }

    useEffect(() => {
        try{
            const matchData = localStorage.getItem("guestMatch");

            if (matchData){
                console.log(matchData)
            }
        }
        catch (err){
            console.error("Error parsing guest match data: ", err);
        }
    }, []);

    return (
        <div className="tracker-page-box">
            <Header></Header>
            <div className="tracker-box">
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
                        </div>
                    </div>
                </div>
            )}

        </div>

    )
}

export default Tracker