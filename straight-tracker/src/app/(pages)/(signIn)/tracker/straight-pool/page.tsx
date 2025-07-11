"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation';

import Header from '@/src/components/Header';

const Tracker: React.FC = () => {
    const router = useRouter();

    const searchParams = useSearchParams();
    const matchID = searchParams.get('matchID');
    const [gameName, setGameName] = useState('');
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [raceTo, setRaceTo] = useState('5');
    const [toShoot, setToShoot] = useState('');
    const [rack, setRack] = useState<number>(1);
    const [remainingBalls, setRemainingBalls] = useState<number>(15);
    const [player1Score, setPlayer1Score] = useState<number>(0);
    const [player1HighRun, setPlayer1HighRun] = useState<number>(0);
    const [player1CurrRun, setPlayer1CurrRun] = useState<number>(0);
    const [player2Score, setPlayer2Score] = useState<number>(0);
    const [player2HighRun, setPlayer2HighRun] = useState<number>(0);
    const [player2CurrRun, setPlayer2CurrRun] = useState<number>(0);
    
    const [winner, setWinner] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => { //Get match info
        const fetchMatch = async () => {
            try{
                const res = await fetch(`/api/getStraightMatch?matchID=${matchID}`);
                const json = await res.json();
                
                if (json.redirect) {
                    router.push(json.redirect);
                    return;
                }

                console.log(json.straightMatch);
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
                        <button className="s-decrement-button">-</button>
                        <p className="s-player1-score">{player1Score}</p>
                        <div className="s-increment-container">
                            <button className="s-increment-button">+</button>
                            <button className="s-increment-button">+2</button>
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
                    <button className="undo-style">Undo</button>
                </div>

                <div className="s-player2-container">
                    <p id = "player2" className="s-player2-name">{player2}</p>
                    <div className="s-score-container">
                        <button className="s-decrement-button">-</button>
                        <p className="s-player2-score">{player2Score}</p>
                        <div className="s-increment-container">
                            <button className="s-increment-button">+</button>
                            <button className="s-increment-button">+2</button>
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