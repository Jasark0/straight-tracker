"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Header from '@/src/components/Header';

export default function History() {
    type PoolMatch = {
        match_id: number;
        game_name: string;
        game_type: number;
        player1: string;
        player2: string;
        race_to: number;
        winner: string | null;
        created_at: string;
        pool_matches_race: {
            player1Score: number;
            player2Score: number;
        }[];
        pool_matches_sets: {
            sets: number;
        }
    };
    
    const router = useRouter();

    const [allMatches, setAllMatches] = useState<PoolMatch[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedGame, setSelectedGame] = useState('');

    const [error, setError] = useState('');

    const gameSelect = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();

        const target = e.target as HTMLElement;

        if (!target.closest(".game-option")){
            setSelectedGame('');
        }
    }

    const selectPage = () => {
        if (selectedGame === "8 Ball"){
            router.push('/select/8-ball');
        }
        else if (selectedGame === "9 Ball"){
            router.push('/select/9-ball'); 
        }
        else if (selectedGame === "10 Ball"){
            router.push('/select/10-ball');
        }
        else if (selectedGame === "Straight Pool (14.1 Continuous)"){
            router.push('/select/straight-pool'); 
        }
        else if (selectedGame === "Snooker"){
            router.push('/select/snooker'); 
        }
    }

    const homePage = () => {
        router.push('/');
    }

    const getGameTypeName = (game_type: number) => {
        switch (game_type){
            case 0:
                return "8-Ball";
            case 1:
                return "9-Ball";
            case 2:
                return "10-Ball";
            default:
                return "None";
        }
    }
    
    useEffect(() => {
        const fetchAllMatches = async () => {
            try{
                const res = await fetch('/api/getAllMatches');
                const json = await res.json();

                if (!res.ok){
                    setError(json.error);
                }

                setAllMatches(json.allPoolMatches);
                console.log(json.allPoolMatches);
            }
            catch (err){
                setError('Network error');
                console.error(err);
            }
        };
        fetchAllMatches();
    }, []);

    return (
        <div className="history-page-box">
            <Header className={`home-title-box ${showModal ? "blurred" : ""}`}>
            </Header>
            <div className={`history-box ${showModal ? "blurred" : ""}`}>
                <button className="new-game" onClick={() => setShowModal(true)}>+ New Game</button>

                <div className="search-row-box">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input className="search-input" placeholder="Search game name" />
                    </div>
                    <button className="icon-button">
                        📅
                    </button>
                    <button className="icon-button">
                        ⬇️
                    </button>
                </div>

                <div className="display-history-box">
                    <div className="history-placeholder-box">
                        {allMatches.length === 0 ? (
                        <p style={{ textAlign: 'center', marginTop: '2rem' }}>
                            No match history found.
                        </p>
                        ) : (
                        <ul className="history-list">
                        {allMatches.map((match) => {
                            let currentScores = null;
                            if (!match.pool_matches_sets){
                                const lastRace = match.pool_matches_race?.[match.pool_matches_race.length - 1];
                                currentScores = lastRace
                                    ? `Score: ${lastRace.player1Score} -  ${lastRace.player2Score}`
                                    : "No race data";
                                }
                                
                                let setsWonDisplay = null;
                                if (match.pool_matches_sets) {
                                const player1SetWins = match.pool_matches_race?.filter(
                                    (race: any) => race.player1Score === match.race_to
                                ).length ?? 0;
                                const player2SetWins = match.pool_matches_race?.filter(
                                    (race: any) => race.player2Score === match.race_to
                                ).length ?? 0;
                                setsWonDisplay = `Sets Score: ${player1SetWins} - ${player2SetWins}`;
                            }

                            return (
                                <div key={match.match_id} className="history-item">
                                <div className="history-row">
                                    <span className="game-type-text">{getGameTypeName(match.game_type)}</span>
                                    <span className="created-at-text">{new Date(match.created_at).toLocaleString(undefined, {
                                        year: 'numeric',
                                        month: 'short', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true, 
                                    })}
                                    </span>
                                </div>

                                <div className="history-row">
                                    <span className="history-game-name-text">Game Name: {match.game_name}</span>
                                    <span className="history-race-to-text">Race to {match.race_to}</span>
                                </div>
                                
                                <div className="history-row">
                                    <span className="history-player-name-text">
                                        {match.player1} vs. {match.player2}
                                    </span>
                                </div>
                                <div className="history-row">
                                    <span>
                                        <span className="history-score-text">
                                            {match.pool_matches_sets ? setsWonDisplay : currentScores}
                                        </span>
                                    </span>
                                    <span>
                                        {match.winner === null ? (
                                            <button
                                                onClick={() => router.push(`/tracker/8-ball?matchID=${match.match_id}`)}
                                                className="history-button continue"
                                            >
                                                Continue Match
                                            </button>
                                        ) : (
                                            <button className="history-button view">View Details</button>
                                        )}
                                    </span>
                                </div>

                            </div>

                            );
                        })}
                        </ul>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={gameSelect}>
                        <h2>Select a Game Type</h2>
                        <div className="game-options">
                            {["8 Ball", "9 Ball", "10 Ball", "Straight Pool (14.1 Continuous)", "Snooker"].map((game) => (
                                <button className={`game-option ${selectedGame === game ? "selected" : ""}`} key={game} onClick={() => setSelectedGame(game)}>
                                    {game}
                                </button>
                            ))}
                        </div>

                        {selectedGame && (
                            <div className="confirm-footer">
                                <button className="next-button" onClick={selectPage}>Next</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
