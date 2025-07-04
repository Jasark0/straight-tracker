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
    const [toBreak, setToBreak] = useState('');
    const [player1Score, setPlayer1Score] = useState();
    const [player2Score, setPlayer2Score] = useState();

    const [loading, setLoading] = useState(true);
    const [a, seta] = useState('');

    const [error, setError] = useState('');

    const testing = () => {
        console.log(a);
        console.log(toBreak);
    }

    // const incrementPlayer1 = () => {
    //     setPlayer1Score(player1Score+1);
    // }

    // const incrementPlayer2 = () => {
    //     setPlayer2Score(player2Score+1);
    // }

    useEffect(() => {
        const fetchMatch = async () => {
            try{
                const res = await fetch(`/api/getMatch8?matchID=${matchID}`);
                const json = await res.json();
                
                if (json.redirect) {
                    router.push(json.redirect);
                    return;
                }
                
                seta(json.poolMatch);

                setGameName(json.match.game_name);
                setPlayer1(json.poolMatch.player1);
                setPlayer2(json.poolMatch.player2);
                setRaceTo(json.poolMatch.race_to);
                setToBreak(json.poolMatch.to_break);
                setPlayer1Score(json.poolMatch.player1Score);
                setPlayer2Score(json.poolMatch.player2Score);

                setSets(json.matchSets.sets); //Load sets last: this prevents rendering inconsistencies.
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
    
    if (loading){
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
                
                <img src="/divider.png" className="divider-css"></img>

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
                            <button className="player1-increment" onClick={testing}>
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
                            <button className="player2-increment">
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
            

                <div className="undo-box">
                    <button className="undo-style">Undo</button>
                </div>
            </div>
        </div>

    )
}

export default Tracker