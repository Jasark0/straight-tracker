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
    const [sets, setSets] = useState('');

    const [error, setError] = useState('');

    // useEffect(() => {
    //     const fetchMatch = async () => {
    //         try{
    //             const res = await fetch(`/api/getMatch8?matchID=${matchID}`);
    //             const json = await res.json();
                
    //             if (json.redirect) {
    //                 router.push(json.redirect);
    //                 return;
    //             }
                
    //             setGameName(json.match.game_name);
    //             setPlayer1(json.poolMatch.player1);
    //             setPlayer2(json.poolMatch.player2);
    //             setRaceTo(json.poolMatch.race_to);
    //             setSets(json.poolMatch.sets);
    //         }
    //         catch (err){
    //             setError('Error');
    //         };
    //     }
    //     fetchMatch();
    // }, [matchID]);


    return (
        <div className="page-box">
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
                    <p className="race-text">-</p>
                    <p className="race-text">Best of {sets} Sets</p>
                </div>

                <p className="set-text">
                    (Set 1)
                </p>
                
                <div className="score-box">
                    <div className="player1-box">
                        <p className="player1-text">
                            {player1}
                        </p>

                        <div className="player1-score-box">
                            <p className="player1-score">
                                0
                            </p>
                            <button className="player1-increment">
                                +
                            </button>
                        </div>

                        <div className="player1-sets-box">
                            <p className="player1-set">
                                0
                            </p>
                            <p className="player1-set-text">
                                Sets
                            </p>
                        </div>
                    </div>

                    <div className="player2-box">
                        <p className="player2-text">
                            {player2}
                        </p>

                        <div className="player1-score-box">
                            <p className="player2-score">
                                0
                            </p>
                            <button className="player2-increment">
                                +
                            </button>
                        </div>

                        <div className="player2-sets-box">
                            <p className="player2-set">
                                0
                            </p>
                            <p className="player2-set-text"> 
                                Sets
                            </p>
                        </div>
                    </div>
                </div>
            

                <div className="undo-box">
                    <button className="undo-style">Undo</button>
                </div>
            </div>
            
        </div>

    )
}

export default Tracker