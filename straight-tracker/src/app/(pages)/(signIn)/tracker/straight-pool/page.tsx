"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '@/src/components/Header';

const Tracker: React.FC = () => {
    const router = useRouter();

    const searchParams = useSearchParams();
    const matchID = searchParams.get('matchID');
    const [gameName, setGameName] = useState('');
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const player1Ref = useRef(player1);
    const player2Ref = useRef(player2);
    const [raceTo, setRaceTo] = useState('5');
    const [toShoot, setToShoot] = useState('');
    const toShootRef = useRef(toShoot);
    const [rack, setRack] = useState<number>(1);
    const [remainingBalls, setRemainingBalls] = useState<number>(15);
    const [player1Score, setPlayer1Score] = useState<number>(0);
    const [player1HighRun, setPlayer1HighRun] = useState<number>(0);
    const [player1CurrRun, setPlayer1CurrRun] = useState<number>(0);
    const player1HighRunRef = useRef(player1HighRun);
    const player1CurrRunRef = useRef(player1CurrRun);
    const [player2Score, setPlayer2Score] = useState<number>(0);
    const [player2HighRun, setPlayer2HighRun] = useState<number>(0);
    const [player2CurrRun, setPlayer2CurrRun] = useState<number>(0);
    const player2HighRunRef = useRef(player2HighRun);
    const player2CurrRunRef = useRef(player2CurrRun);
    
    const [winner, setWinner] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    type ActionType = 'increment' | 'foul' | 'miss' | '3_foul_penalty';

    type Action = {
        player: string;
        ActionType: string;
        prevScore?: number; //Only store this for CR
        prevRemainingBalls?: number; //Only store this for 3 foul rule
        prevPlayerHighRun?: number;
        prevPlayerCurrRun?: number;
    };

    const [actionHistory, setActionHistory] = useState<Action[]>([]);

    const incrementPlayer1 = async () => {
        const action: Action = {
            player: 'player1',
            ActionType: 'increment',
        }

        if (toShoot === player2){ //Handles when user forgets to press spacebar to miss
            missPlayer();
        }

        setPlayer1Score(player1Score + 1);

        const prevCurrRun = player1CurrRun;
        setPlayer1CurrRun(prevCurrRun + 1);

        if (prevCurrRun + 1 > player1HighRun){ //Replace highRun by currRun if higher
            action.prevPlayerHighRun = player1HighRun; //Declare previous player high run when replaced into action stack
            setPlayer1HighRun(prevCurrRun + 1);
        }

        if (remainingBalls - 1 === 1){ //Updates remaining balls
            setRemainingBalls(15); 
            setRack(rack + 1);
        }
        else{
            setRemainingBalls(remainingBalls - 1);
        }

        setActionHistory(history => [...history, action]);
    };

    const clearRackPlayer1 = async () => { //Work on this later

    }

    const decrementPlayer1 = async () => {
        if (toShoot === player2){ //Handles when user forgets to press spacebar to miss
            missPlayer();
        }

        const action: Action = {
            player: 'player1',
            ActionType: 'foul',
            prevPlayerCurrRun: player1CurrRun,
        }

        let foulCount = 0;

        for (let i = actionHistory.length-1; i>=0; i--){ //3 foul rule iteration check
            const pastAction = actionHistory[i];

            if (pastAction.player === 'player1'){
                if (pastAction.ActionType === 'foul'){
                    foulCount++;
                }
                else{
                    break;
                }
            }

            if (foulCount === 2){
                action.ActionType = '3_foul_penalty';
                action.prevRemainingBalls = remainingBalls;

                setPlayer1Score(player1Score - 16);
                setPlayer1CurrRun(0);
                setRemainingBalls(15);
                setRack(rack + 1);
                setToShoot(player2);
                setActionHistory(history => [...history, action]);
                return;
            }
        }

        setPlayer1Score(player1Score - 1);
        setPlayer1CurrRun(0);
        setToShoot(player2);

        setActionHistory(history => [...history, action]);
    }

    const incrementPlayer2 = async () => {
        const action: Action = {
            player: 'player2',
            ActionType: 'increment',
        }

        if (toShoot === player1){ //Handles when user forgets to press spacebar to miss
            missPlayer();
        }

        setPlayer2Score(player2Score + 1);

        const prevCurrRun = player2CurrRun;
        setPlayer2CurrRun(prevCurrRun + 1);

        if (prevCurrRun + 1 > player2HighRun){ //Replace highRun by currRun if higher
            action.prevPlayerHighRun = player2HighRun; //Declare previous player high run when replaced into action stack
            setPlayer2HighRun(prevCurrRun + 1);
        }

        if (remainingBalls - 1 === 1){ //Updates remaining balls
            setRemainingBalls(15); 
            setRack(rack + 1);
        }
        else{
            setRemainingBalls(remainingBalls - 1);
        }

        setActionHistory(history => [...history, action]);
    };

    const clearRackPlayer2 = async () => { //Work on this later

    }


    const decrementPlayer2 = async () => {
        if (toShoot === player1){ //Handles when user forgets to press spacebar to miss
            missPlayer();
        }

        const action: Action = {
            player: 'player2',
            ActionType: 'foul',
            prevPlayerCurrRun: player2CurrRun,
        }

        let foulCount = 0;

        for (let i = actionHistory.length-1; i>=0; i--){ //3 foul rule iteration check
            const pastAction = actionHistory[i];

            if (pastAction.player === 'player2'){
                if (pastAction.ActionType === 'foul'){
                    foulCount++;
                }
                else{
                    break;
                }
            }
            
            if (foulCount === 2){
                action.ActionType = '3_foul_penalty';
                action.prevRemainingBalls = remainingBalls;

                setPlayer2Score(player2Score - 16);
                setPlayer2CurrRun(0);
                setRemainingBalls(15);
                setRack(rack + 1);
                setToShoot(player1);
                setActionHistory(history => [...history, action]);
                return;
            }
        }

        setPlayer2Score(player2Score - 1);
        setPlayer2CurrRun(0);
        setToShoot(player1);

        setActionHistory(history => [...history, action]);
    }

    const missPlayer = () => {
        const currentToShoot = toShootRef.current;
        const currentPlayer1 = player1Ref.current;
        const currentPlayer2 = player2Ref.current;

        const action: Action = {
            player: currentToShoot === currentPlayer1 ? 'player1' : 'player2',
            ActionType: 'miss',
        };

        if (currentToShoot === currentPlayer1){
            action.prevPlayerCurrRun = player1CurrRunRef.current;
            setPlayer1CurrRun(0);
        }
        else if (currentToShoot === currentPlayer2){
            action.prevPlayerCurrRun = player2CurrRunRef.current;
            setPlayer2CurrRun(0);
        }

        const nextPlayer = currentToShoot === currentPlayer1 ? currentPlayer2 : currentPlayer1;

        setToShoot(nextPlayer);
        setActionHistory((history) => [...history, action]);
    }

    const handleUndo = () => { //Undo button logic
        const lastAction = actionHistory[actionHistory.length - 1];
        if (!lastAction) return;

        if (lastAction.player === 'player1'){
            if (lastAction.ActionType === 'increment'){
                setPlayer1Score(player1Score-1);
                setPlayer1CurrRun(player1CurrRun-1);

                const prevRemainingBalls = remainingBalls;

                if (prevRemainingBalls + 1 > 15){
                    setRemainingBalls(2);
                    setRack(rack - 1);
                }
                else{
                    setRemainingBalls(prevRemainingBalls + 1);
                }

                if (lastAction.prevPlayerHighRun !== undefined){
                    setPlayer1HighRun(lastAction.prevPlayerHighRun);
                }
            }
            else if (lastAction.ActionType === 'foul'){
                setPlayer1Score(player1Score+1);

                if (lastAction.prevPlayerCurrRun !== undefined){
                    setPlayer1CurrRun(lastAction.prevPlayerCurrRun);
                }
            }
            else if (lastAction.ActionType === '3_foul_penalty'){
                setPlayer1Score(player1Score+16);
                setRack(rack - 1);

                if (lastAction.prevRemainingBalls !== undefined){
                    setRemainingBalls(lastAction.prevRemainingBalls);
                }

                if (lastAction.prevPlayerCurrRun !== undefined){
                    setPlayer1CurrRun(lastAction.prevPlayerCurrRun);
                }
            }
            else if (lastAction.ActionType === 'miss'){
                if (lastAction.prevPlayerCurrRun !== undefined){
                    setPlayer1CurrRun(lastAction.prevPlayerCurrRun);
                }
            }
            setToShoot(player1);

        }
        else if (lastAction.player === 'player2'){
            if (lastAction.ActionType === 'increment'){
                setPlayer2Score(player2Score-1);
                setPlayer2CurrRun(player2CurrRun-1);

                const prevRemainingBalls = remainingBalls;

                if (prevRemainingBalls + 1 > 15){
                    setRemainingBalls(2);
                    setRack(rack - 1);
                }
                else{
                    setRemainingBalls(prevRemainingBalls + 1);
                }

                if (lastAction.prevPlayerHighRun !== undefined){
                    setPlayer2HighRun(lastAction.prevPlayerHighRun);
                }
            }
            else if (lastAction.ActionType === 'foul'){
                setPlayer2Score(player2Score+1);

                if (lastAction.prevPlayerCurrRun !== undefined){
                    setPlayer2CurrRun(lastAction.prevPlayerCurrRun);
                }
            }
            else if (lastAction.ActionType === '3_foul_penalty'){
                setPlayer2Score(player2Score+16);

                if (lastAction.prevRemainingBalls !== undefined){
                    setRemainingBalls(lastAction.prevRemainingBalls);
                }

                if (lastAction.prevPlayerCurrRun !== undefined){
                    setPlayer2CurrRun(lastAction.prevPlayerCurrRun);
                }
            }
            else if (lastAction.ActionType === 'miss'){
                if (lastAction.prevPlayerCurrRun !== undefined){
                    setPlayer2CurrRun(lastAction.prevPlayerCurrRun);
                }
            }
            setToShoot(player2);
        }

        setActionHistory(prev => prev.slice(0, -1));
    }

    useEffect(() => { //Get match info
        const fetchMatch = async () => {
            try{
                const res = await fetch(`/api/getStraightMatch?matchID=${matchID}`);
                const json = await res.json();
                
                if (json.redirect) {
                    router.push(json.redirect);
                    return;
                }

                setGameName(json.straightMatch.game_name);
                setPlayer1(json.straightMatch.player1);
                setPlayer2(json.straightMatch.player2);
                setRaceTo(json.straightMatch.race_to);
                setToShoot(json.straightMatch.to_shoot);
                setRack(json.straightMatch.rack);
                setRemainingBalls(json.straightMatch.remaining_balls);
                setPlayer1Score(json.straightMatch.player1_score);
                setPlayer1HighRun(json.straightMatch.player1_high_run);
                setPlayer1CurrRun(json.straightMatch.player1_curr_run);
                setPlayer2Score(json.straightMatch.player2_score);
                setPlayer2HighRun(json.straightMatch.player2_high_run);
                setPlayer2CurrRun(json.straightMatch.player2_curr_run)
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

    useEffect(() => { //Updates references of player1, player2, toShoot for keybaordEvent's sake
        player1Ref.current = player1;
        player2Ref.current = player2;
        toShootRef.current = toShoot;
        player1HighRunRef.current = player1HighRun;
        player1CurrRunRef.current = player1CurrRun;
        player2HighRunRef.current = player2HighRun;
        player2CurrRunRef.current = player2CurrRun;
    }, [player1, player2, toShoot, player1HighRun, player1CurrRun, player2HighRun, player2CurrRun]);

    useEffect(() => { //Spacebar event calls a player miss
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                missPlayer();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(()=>{
        // console.log(actionHistory); 
    }, [actionHistory])

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
        <div className="s-main-container">
            <Header></Header>
            <ToastContainer className="s-toast-warning"/>

            <p className="s-game-name-text">
                Game Name: {gameName}
            </p>
            <p className="s-race-to-text">
                Race To: {raceTo} Balls
            </p>

            <img src="/divider.png" className="s-tracker-divider-css"></img>

            <div className="s-player-container">
                <div className="s-player1-container">
                    <p id = "player1" className="s-player1-name">{player1}</p>
                    <div className="s-score-container">
                        <button className="s-decrement-button" onClick={decrementPlayer1}>-</button>
                        <p className="s-player1-score">{player1Score}</p>
                        <div className="s-increment-container">
                            <button className="s-increment-button" onClick={incrementPlayer1}>+</button>
                            <div className="CR-container">
                                <button className="s-increment-button">CR</button>
                                <button className="CR-icon">i</button>
                            </div>
                        </div>
                    </div>
        
                    <div className="high-style player1-high-run">
                        High Run: {player1HighRun}
                    </div>
                    <div className="high-style player1-curr-high-run">
                        Current High Run: {player1CurrRun}
                    </div>
                </div>

                <div className="remaining-turn-container">
                    <div className="remaining-balls-container">
                        <p className="remaining-balls-style remaining-balls">{remainingBalls}</p>
                        <p className="remaining-balls-style">Remaining Balls</p>
                        <p className="rack-number">(Rack {rack})</p>
                    </div>
                    <p className="s-to-shoot-text"> 
                        {toShoot} to shoot!
                    </p>
                    <div className="arrow-container">
                        <img src={toShoot === player1 ? "/leftArrow.png" : "/rightArrow.png"} className="arrow-image-style" id="player-turn"></img>
                        <div className="player-turn-text-style" id="player-turn-text">
                        </div>
                        <div className="player-swap-text-container">
                            <div className="player-swap-text-style">
                                (Press 
                            </div>
                            <div className="player-swap-spacebar-text-style">
                                spacebar
                            </div>
                            <div className="player-swap-text-style">
                                to swap turn)
                            </div>
                        </div>
                    </div>
                    <button className="undo-style" onClick={handleUndo} disabled={actionHistory.length === 0}>Undo</button>
                </div>

                <div className="s-player2-container">
                    <p id = "player2" className="s-player2-name">{player2}</p>
                    <div className="s-score-container">
                        <button className="s-decrement-button" onClick={decrementPlayer2}>-</button>
                        <p className="s-player2-score">{player2Score}</p>
                        <div className="s-increment-container">
                            <button className="s-increment-button" onClick={incrementPlayer2}>+</button>
                            <button className="s-increment-button">CR</button>
                        </div>     
                    </div>

                    <div className="high-style player2-high-run">
                        High Run: {player2HighRun}
                    </div>
                    <div className="high-style player2-curr-high-run">
                        Current High Run: {player2CurrRun}
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Tracker