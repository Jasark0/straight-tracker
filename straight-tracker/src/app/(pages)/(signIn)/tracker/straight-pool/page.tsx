"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import Icon from '@mdi/react';
import { mdiHelpCircle, mdiCog } from '@mdi/js';
import { useSearchParams, usePathname } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Loading from '@/src/components/PageLoading'

const Tracker: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [helpModal, setHelpModal] = useState(false);

    const matchID = searchParams.get('matchID');
    const [gameName, setGameName] = useState('');
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const player1Ref = useRef(player1);
    const player2Ref = useRef(player2);
    const [raceTo, setRaceTo] = useState<number>(0);
    const [toShoot, setToShoot] = useState<1|2>(1);
    const toShootRef = useRef(toShoot);
    const [rack, setRack] = useState<number>(1);
    const [remainingBalls, setRemainingBalls] = useState<number>(15);
    const [player1Score, setPlayer1Score] = useState<number>(0);
    const [player1Foul, setPlayer1Foul] = useState<number>(0);
    const player1FoulRef = useRef(player1Foul);
    const [player1HighRun, setPlayer1HighRun] = useState<number>(0);
    const [player1CurrRun, setPlayer1CurrRun] = useState<number>(0);
    const player1HighRunRef = useRef(player1HighRun);
    const player1CurrRunRef = useRef(player1CurrRun);
    const [player2Score, setPlayer2Score] = useState<number>(0);
    const [player2Foul, setPlayer2Foul] = useState<number>(0);
    const player2FoulRef = useRef(player2Foul);
    const [player2HighRun, setPlayer2HighRun] = useState<number>(0);
    const [player2CurrRun, setPlayer2CurrRun] = useState<number>(0);
    const player2HighRunRef = useRef(player2HighRun);
    const player2CurrRunRef = useRef(player2CurrRun);
    
    const [winner, setWinner] = useState<1|2|null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    type Action = {
        player: string;
        ActionType: string;
        prevRemainingBalls?: number; //Only store this for 3 foul rule & CR
        prevFouls?: number;
        prevPlayerHighRun?: number;
        prevPlayerCurrRun?: number;
    };

    const [actionHistory, setActionHistory] = useState<Action[]>([]);

    const incrementPlayer1 = async () => {
        const action: Action = {
            player: 'player1',
            ActionType: 'increment',
        }

        const updatedScore = player1Score + 1;
        const updatedCurrRun = player1CurrRun + 1;
        const updatedHighRun = Math.max(updatedCurrRun, player1HighRun);

        setPlayer1Score(updatedScore);

        if (player1Foul !== 0){
            action.prevFouls = player1Foul;
            setPlayer1Foul(0);
        }
        
        setPlayer1CurrRun(updatedCurrRun);

        if (toShoot === 2){ //Handles when user forgets to press spacebar to miss
            missPlayer();
        }

        if (updatedHighRun > player1HighRun){ //Replace highRun by currRun if higher
            action.prevPlayerHighRun = player1HighRun; //Declare previous player high run when replaced into action stack
            setPlayer1HighRun(updatedHighRun);
        }

        if (remainingBalls - 1 === 1){ //Updates remaining balls
            setRemainingBalls(15); 
            setRack(rack + 1);
        }
        else{
            setRemainingBalls(remainingBalls - 1);
        }  

        if (updatedScore === raceTo){
            updateStraightMatch(toShoot, rack, remainingBalls, updatedScore, player1Foul, updatedHighRun, updatedCurrRun, 
                player2Score, player2Foul, player2HighRun, player2CurrRun);
            handleWinner(1);
        }

        setActionHistory(history => [...history, action]);
    };

    const clearRackPlayer1 = async () => { 
        const clearScore = remainingBalls - 1;

        if (remainingBalls === 2){
            incrementPlayer1();
            return;
        }

        const action: Action = {
            player: 'player1',
            ActionType: 'increment',
            prevRemainingBalls: remainingBalls,
        }

        if (toShoot === 2){ //Handles when user forgets to press spacebar to miss
            missPlayer();
        }

        const updatedScore = player1Score + clearScore;
        const updatedCurrRun = player1CurrRun + clearScore;
        const updatedHighRun = Math.max(updatedCurrRun, player1HighRun);

        setPlayer1Score(updatedScore);

        if (player1Foul !== 0){
            action.prevFouls = player1Foul;
            setPlayer1Foul(0);
        }

        setPlayer1CurrRun(updatedCurrRun);

        if (updatedHighRun > player1HighRun){ //Replace highRun by currRun if higher
            action.prevPlayerHighRun = player1HighRun; //Declare previous player high run when replaced into action stack
            setPlayer1HighRun(updatedHighRun);
        }

        setRemainingBalls(15);
        setRack(rack + 1);

        if (updatedScore >= raceTo){
            updateStraightMatch(toShoot, rack, remainingBalls, updatedScore, player1Foul, updatedHighRun, updatedCurrRun, 
                player2Score, player2Foul, player2HighRun, player2CurrRun);
            handleWinner(1);
        }

        setActionHistory(history => [...history, action]);
    }

    const decrementPlayer1 = async () => {
        if (toShoot === 2){ //Handles when user forgets to press spacebar to miss
            missPlayer();
        }

        const action: Action = {
            player: 'player1',
            ActionType: 'foul',
            prevPlayerCurrRun: player1CurrRun,
            prevFouls: player1Foul,
        }

        const finalFouls = player1Foul + 1;

        if (finalFouls === 2){
            toast.error(`${player1} is on 2 consecutive fouls, with a 3rd foul, ${player1} will take a 15 point penalty alongside with a rack reset.`, {
                className: "s-toast-warning",
                position: "top-right",
                autoClose: 7500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
        else if (finalFouls === 3){
            toast.error(`${player1} is on 3 consecutive fouls, a 15 point penalty is applied. At this time, please reset the rack.`, {
                className: "s-toast-warning",
                position: "top-right",
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });

            action.ActionType = '3_foul_penalty';
            action.prevRemainingBalls = remainingBalls;

            setPlayer1Score(player1Score - 16);
            setPlayer1Foul(0);
            setPlayer1CurrRun(0);
            setRemainingBalls(15);
            setRack(rack + 1);
            setToShoot(2);
            setActionHistory(history => [...history, action]);
            return;
        }

        setPlayer1Score(player1Score - 1);
        setPlayer1Foul(finalFouls);
        setPlayer1CurrRun(0);
        setToShoot(2);

        setActionHistory(history => [...history, action]);
    }

    const incrementPlayer2 = async () => {
        const action: Action = {
            player: 'player2',
            ActionType: 'increment',
        }

        const updatedScore = player2Score + 1;
        const updatedCurrRun = player2CurrRun + 1;
        const updatedHighRun = Math.max(updatedCurrRun, player2HighRun);

        setPlayer2Score(updatedScore);
        
        if (player2Foul !== 0){
            action.prevFouls = player2Foul;
            setPlayer2Foul(0);
        }
        
        setPlayer2CurrRun(updatedCurrRun);

        if (toShoot === 1){ //Handles when user forgets to press spacebar to miss
            missPlayer();
        }

        if (updatedHighRun > player2HighRun){ //Replace highRun by currRun if higher
            action.prevPlayerHighRun = player2HighRun; //Declare previous player high run when replaced into action stack
            setPlayer2HighRun(updatedHighRun);
        }

        if (remainingBalls - 1 === 1){ //Updates remaining balls
            setRemainingBalls(15); 
            setRack(rack + 1);
        }
        else{
            setRemainingBalls(remainingBalls - 1);
        }  

        if (updatedScore === raceTo){
            updateStraightMatch(toShoot, rack, remainingBalls, player1Score, player1Foul, player1HighRun, player1CurrRun, 
                updatedScore, player2Foul, updatedHighRun, updatedCurrRun);
            handleWinner(2);
        }

        setActionHistory(history => [...history, action]);
    };

    const clearRackPlayer2 = async () => {
        const clearScore = remainingBalls - 1;

        if (remainingBalls === 2){
            incrementPlayer2();
            return;
        }

        const action: Action = {
            player: 'player2',
            ActionType: 'increment',
            prevRemainingBalls: remainingBalls,
        }

        if (toShoot === 1){ //Handles when user forgets to press spacebar to miss
            missPlayer();
        }

        const updatedScore = player2Score + clearScore;
        const updatedCurrRun = player2CurrRun + clearScore;
        const updatedHighRun = Math.max(updatedCurrRun, player2HighRun);

        setPlayer2Score(updatedScore);

        if (player2Foul !== 0){
            action.prevFouls = player2Foul;
            setPlayer2Foul(0);
        }

        setPlayer2CurrRun(updatedCurrRun);

        if (updatedHighRun > player2HighRun){ //Replace highRun by currRun if higher
            action.prevPlayerHighRun = player2HighRun; //Declare previous player high run when replaced into action stack
            setPlayer2HighRun(updatedHighRun);
        }

        setRemainingBalls(15);
        setRack(rack + 1);

        if (updatedScore >= raceTo){
            updateStraightMatch(toShoot, rack, remainingBalls, player1Score, player1Foul, player1HighRun, player1CurrRun, 
                updatedScore, player2Foul, updatedHighRun, updatedCurrRun);
            handleWinner(2);
        }

        setActionHistory(history => [...history, action]);
    }

    const decrementPlayer2 = async () => {
        if (toShoot === 1){ //Handles when user forgets to press spacebar to miss
            missPlayer();
        }

        const action: Action = {
            player: 'player2',
            ActionType: 'foul',
            prevPlayerCurrRun: player2CurrRun,
            prevFouls: player2Foul,
        }

        let finalFouls = player2Foul + 1;

        if (finalFouls === 2){
            toast.error(`${player2} is on 2 consecutive fouls, with a 3rd foul, ${player2} will take a 15 point penalty alongside with a rack reset.`, {
                className: "s-toast-warning",
                position: "top-right",
                autoClose: 7500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
        }
        else if (finalFouls === 3){
            toast.error(`${player2} is on 3 consecutive fouls, a 15 point penalty is applied. At this time, please reset the rack.`, {
                className: "s-toast-warning",
                position: "top-right",
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });

            action.ActionType = '3_foul_penalty';
            action.prevRemainingBalls = remainingBalls;

            setPlayer2Score(player2Score - 16);
            setPlayer2Foul(0);
            setPlayer2CurrRun(0);
            setRemainingBalls(15);
            setRack(rack + 1);
            setToShoot(1);
            setActionHistory(history => [...history, action]);
            return;
        }

        setPlayer2Score(player2Score - 1);
        setPlayer2Foul(finalFouls);
        setPlayer2CurrRun(0);
        setToShoot(1);

        setActionHistory(history => [...history, action]);
    }

    const missPlayer = () => {
        const currentToShoot = toShootRef.current;

        const action: Action = {
            player: currentToShoot === 1 ? 'player1' : 'player2',
            ActionType: 'miss',
        };

        if (currentToShoot === 1){
            action.prevPlayerCurrRun = player1CurrRunRef.current;
            setPlayer1CurrRun(0);
            
            const currentFoul = player1FoulRef.current;
            if (currentFoul !== 0){
                action.prevFouls = currentFoul;
                setPlayer1Foul(0);
            }
        }
        else if (currentToShoot === 2){
            action.prevPlayerCurrRun = player2CurrRunRef.current;
            setPlayer2CurrRun(0);
            
            const currentFoul = player2FoulRef.current;
            if (currentFoul !== 0){
                action.prevFouls = currentFoul;
                setPlayer2Foul(0);
            }
        }

        const nextPlayer = currentToShoot === 1 ? 2 : 1;

        setToShoot(nextPlayer);
        setActionHistory((history) => [...history, action]);
    }

    const handleUndo = () => { //Undo button logic
        const lastAction = actionHistory[actionHistory.length - 1];
        if (!lastAction) return;

        if (lastAction.player === 'player1'){
            if (lastAction.ActionType === 'increment'){
                if (lastAction.prevRemainingBalls !== undefined){ //Undo for clear rack
                    const clearScore = lastAction.prevRemainingBalls - 1;
                    setPlayer1Score(player1Score - clearScore);
                    setPlayer1CurrRun(player1CurrRun - clearScore);
                    setRemainingBalls(lastAction.prevRemainingBalls);
                    setRack(rack - 1);
                }
                else{
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
                }

                if (lastAction.prevFouls !== undefined){
                    setPlayer1Foul(lastAction.prevFouls);
                }

                if (lastAction.prevPlayerHighRun !== undefined){
                    setPlayer1HighRun(lastAction.prevPlayerHighRun);
                }
            }
            else if (lastAction.ActionType === 'foul'){
                setPlayer1Score(player1Score + 1);
                if (lastAction.prevFouls !== undefined){
                    setPlayer1Foul(lastAction.prevFouls);
                }
                else{
                    setPlayer1Foul(0);
                }

                if (lastAction.prevPlayerCurrRun !== undefined){
                    setPlayer1CurrRun(lastAction.prevPlayerCurrRun);
                }
            }
            else if (lastAction.ActionType === '3_foul_penalty'){
                setPlayer1Score(player1Score + 16);
                setRack(rack - 1);

                if (lastAction.prevRemainingBalls !== undefined){
                    setRemainingBalls(lastAction.prevRemainingBalls);
                }

                if (lastAction.prevFouls !== undefined){
                    setPlayer1Foul(lastAction.prevFouls);
                }

                if (lastAction.prevPlayerCurrRun !== undefined){
                    setPlayer1CurrRun(lastAction.prevPlayerCurrRun);
                }
            }
            else if (lastAction.ActionType === 'miss'){
                if (lastAction.prevPlayerCurrRun !== undefined){
                    setPlayer1CurrRun(lastAction.prevPlayerCurrRun);
                }

                if (lastAction.prevFouls !== undefined){
                    setPlayer1Foul(lastAction.prevFouls);
                }
            }
            setToShoot(1);
        }
        else if (lastAction.player === 'player2'){
            if (lastAction.ActionType === 'increment'){
                if (lastAction.prevRemainingBalls !== undefined){ //Undo for clear rack
                    const clearScore = lastAction.prevRemainingBalls - 1;
                    setPlayer2Score(player2Score - clearScore);
                    setPlayer2CurrRun(player2CurrRun - clearScore);
                    setRemainingBalls(lastAction.prevRemainingBalls);
                    setRack(rack - 1);
                }
                else{
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
                }
                
                if (lastAction.prevFouls !== undefined){
                    setPlayer2Foul(lastAction.prevFouls);
                }

                if (lastAction.prevPlayerHighRun !== undefined){
                    setPlayer2HighRun(lastAction.prevPlayerHighRun);
                }
            }
            else if (lastAction.ActionType === 'foul'){
                setPlayer2Score(player2Score + 1);

                if (lastAction.prevFouls !== undefined){
                    setPlayer2Foul(lastAction.prevFouls);
                }
                else{
                    setPlayer2Foul(0);
                }

                if (lastAction.prevPlayerCurrRun !== undefined){
                    setPlayer2CurrRun(lastAction.prevPlayerCurrRun);
                }
            }
            else if (lastAction.ActionType === '3_foul_penalty'){
                setPlayer2Score(player2Score + 16);

                if (lastAction.prevRemainingBalls !== undefined){
                    setRemainingBalls(lastAction.prevRemainingBalls);
                }

                if (lastAction.prevFouls !== undefined){
                    setPlayer2Foul(lastAction.prevFouls);
                }

                if (lastAction.prevPlayerCurrRun !== undefined){
                    setPlayer2CurrRun(lastAction.prevPlayerCurrRun);
                }
            }
            else if (lastAction.ActionType === 'miss'){
                if (lastAction.prevPlayerCurrRun !== undefined){
                    setPlayer2CurrRun(lastAction.prevPlayerCurrRun);
                }

                if (lastAction.prevFouls !== undefined){
                    setPlayer2Foul(lastAction.prevFouls);
                }
            }
            setToShoot(2);
        }

        setActionHistory(prev => prev.slice(0, -1));
    }

    const updateStraightMatch = async (toShoot: 1|2, rack: number, remainingBalls: number, 
        updatedPlayer1Score: number, updatedPlayer1Foul: number, updatedPlayer1HighRun: number, updatedPlayer1CurrRun: number,
        updatedPlayer2Score: number, updatedPlayer2Foul: number, updatedPlayer2HighRun: number, updatedPlayer2CurrRun: number) => { //updates scores to database
        try {
            const res = await fetch('/api/updateStraightMatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    match_id: matchID,
                    to_shoot: toShoot,
                    rack,
                    remaining_balls: remainingBalls,
                    player1_score: updatedPlayer1Score,
                    player1_foul: updatedPlayer1Foul,
                    player1_high_run: updatedPlayer1HighRun,
                    player1_curr_run: updatedPlayer1CurrRun,
                    player2_score: updatedPlayer2Score,
                    player2_foul: updatedPlayer2Foul,
                    player2_high_run: updatedPlayer2HighRun,
                    player2_curr_run: updatedPlayer2CurrRun,
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

    const handleWinner = async (winnerValue: 1 | 2 | null) => { //Updates winner when score matches requirement
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

    const handleConfigureGame = async () => {
        await updateStraightMatch(toShoot, rack, remainingBalls, player1Score, player1Foul, player1HighRun, player1CurrRun, 
            player2Score, player2Foul, player2HighRun, player2CurrRun);

        router.push(`/configure/straight-pool?matchID=${matchID}`);
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
                setPlayer1Foul(json.straightMatch.player1_foul);
                setPlayer1HighRun(json.straightMatch.player1_high_run);
                setPlayer1CurrRun(json.straightMatch.player1_curr_run);
                setPlayer2Score(json.straightMatch.player2_score);
                setPlayer2Foul(json.straightMatch.player2_foul);
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

    useEffect(() => { //Updates references of player1, player2, toShoot, for keybaordEvent's sake
        player1Ref.current = player1;
        player2Ref.current = player2;
        toShootRef.current = toShoot;
        player1FoulRef.current = player1Foul;
        player1HighRunRef.current = player1HighRun;
        player1CurrRunRef.current = player1CurrRun;
        player2FoulRef.current = player2Foul;
        player2HighRunRef.current = player2HighRun;
        player2CurrRunRef.current = player2CurrRun;
    }, [player1, player2, toShoot, player1Foul, player1HighRun, player1CurrRun, player2Foul, player2HighRun, player2CurrRun]);

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

    useEffect(() => { //Updating database with scores and runs every 15 seconds
        if (!matchID) return;

        const interval = setInterval(() => {
            updateStraightMatch(toShoot, rack, remainingBalls, player1Score, player1Foul, player1HighRun, player1CurrRun, 
                player2Score, player2Foul, player2HighRun, player2CurrRun);
        }, 15000);

        return () => clearInterval(interval);
    }, [matchID, toShoot, rack, remainingBalls, player1Score, player1Foul, player1HighRun, player1CurrRun, 
        player2Score, player2Foul, player2HighRun, player2CurrRun])

    useEffect(() => { //Updating database with scores and runs on reload & leaving tab
        if (!matchID) return;
        
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                const payload = JSON.stringify({
                    match_id: matchID,
                    to_shoot: toShoot,
                    rack,
                    remaining_balls: remainingBalls,
                    player1_score: player1Score,
                    player1_foul: player1Foul,
                    player1_high_run: player1HighRun,
                    player1_curr_run: player1CurrRun,
                    player2_score: player2Score,
                    player2_foul: player2Foul,
                    player2_high_run: player2HighRun,
                    player2_curr_run: player2CurrRun,
                });

                const blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon('/api/updateStraightMatch', blob);
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [matchID, toShoot, rack, remainingBalls, player1Score, player1Foul, player1HighRun, player1CurrRun, 
        player2Score, player2Foul, player2HighRun, player2CurrRun])


    if (loading){
        return <Loading/>;
    }

    return (
        <div className="s-page-container">  
            <ToastContainer className="s-toast-warning"/>
            <div className="tracker-help-gear-container">
                <button className="tracker-help-button" onClick={() => {setHelpModal(true)}}>
                    <Icon path={mdiHelpCircle} size={1} />
                </button>

                <button className="tracker-gear-button" onClick={handleConfigureGame} title="Configure Match">
                    <Icon path={mdiCog} size={1} />
                </button>
            </div>

            <p className="s-game-name-text">
                {gameName}
            </p>
            <p className="s-race-to-text">
                Race To - {raceTo} Balls
            </p>

            <div className="s-remaining-balls-container">
                <p className="s-remaining-balls-style remaining-balls">{remainingBalls}</p>
                <p className="s-remaining-balls-style">Remaining Balls</p>
                <p className="s-rack-number">(Rack {rack})</p>
            </div>

            <img src="/divider.png" className="s-tracker-divider-css"></img>

            <div className="s-player-container">
                <div className="s-player1-container">
                    <p id = "player1" className="tracker-player1-name-text">{player1}</p>

                    {player1Foul > 0 && (<p className="s-player1-foul">{player1} is on {player1Foul} foul.</p>)}

                    <div className="s-score-container">
                        <button className="tracker-player1-increment" onClick={decrementPlayer1}>-</button>
                        <p className="tracker-player-score-text player1">
                            {player1Score}
                        </p>
                        <div className="s-increment-container">
                            <button className="tracker-player1-increment" onClick={incrementPlayer1}>+</button>
                            <button className="tracker-player1-increment" onClick={clearRackPlayer1}>CR</button>
                        </div>
                    </div>
        
                    <div className="s-run-text">
                        High Run: {player1HighRun}
                    </div>
                    <div className="s-run-text">
                        Current Run: {player1CurrRun}
                    </div>
                </div>

                <div className="remaining-turn-container">
                    <p className="s-to-shoot-text"> 
                        {toShoot === 1 ? `${player1}` : `${player2}`} to shoot!
                    </p>

                    <div className="arrow-container">
                        <img src={toShoot === 1 ? "/leftArrow.png" : "/rightArrow.png"} className="arrow-image-style" id="player-turn"></img>
                        
                        <div className="player-turn-text-style" id="player-turn-text"></div>
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

                    <button className="tracker-undo-button" onClick={handleUndo} disabled={actionHistory.length === 0}>Undo</button>
                </div>

                <div className="s-player2-container">
                    <p id = "player2" className="tracker-player2-name-text">{player2}</p>

                    {player2Foul > 0 && (<p className="s-player2-foul">{player2} is on {player2Foul} foul.</p>)}

                    <div className="s-score-container">
                        <button className="tracker-player2-increment" onClick={decrementPlayer2}>-</button>
                        <p className="tracker-player-score-text player2">
                            {player2Score}
                        </p>
                        <div className="s-increment-container">
                            <button className="tracker-player2-increment" onClick={incrementPlayer2}>+</button>
                            <button className="tracker-player2-increment" onClick={clearRackPlayer2}>CR</button>
                        </div>     
                    </div>

                    <div className="s-run-text">
                        High Run: {player2HighRun}
                    </div>
                    <div className="s-run-text">
                        Current Run: {player2CurrRun}
                    </div>
                </div>
            </div>
            
            {helpModal && (
                <div className="tracker-help-modal" onClick={() => setHelpModal(false)}>
                    <div className="tracker-help-modal-content" onClick={(e) => {e.stopPropagation()}}>
                        <p className="tracker-help-title-text">How to Use the Straight Pool Tracker</p>

                        <ul className="tracker-help-list">
                            <li>
                                <button className="tracker-player1-increment help" disabled>
                                    +
                                </button>
                                <strong>(Increment Button)</strong>: Press this when a player makes a shot.
                            </li>
                            <li>
                                <button className="tracker-player1-increment help" disabled>
                                    -
                                </button>
                                <strong>(Decrement Button)</strong>: Press this when a player fouls. 
                            </li>
                            <li>
                                <strong>Undo</strong>: Undo the last action (miss/increment/decrement/CR).
                            </li>
                            <li>
                                <button className="tracker-gear-button" onClick={handleConfigureGame}>
                                    <Icon path={mdiCog} size={1}/> 
                                </button>
                                <strong> Configure Match</strong>:
                                Configure match settings such as race to, updating game name/player names.
                                Click it to update match settings.
                            </li>
                            <li>
                                <strong>Winner Prompt</strong>: A winner will be displayed when a player reaches the required score.
                            </li>
                        </ul>

                        <div className="tracker-help-button-container">
                            <button className="tracker-help-close-button" onClick={() => {setHelpModal(false)}}>
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}

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