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
            player1_score: number;
            player2_score: number;
        }[];
        pool_matches_sets: {
            sets: number;
        }
    };
    
    const router = useRouter();

    const [allMatches, setAllMatches] = useState<PoolMatch[]>([]);
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<PoolMatch>();
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedGame, setSelectedGame] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    
    const deleteMatch = async () =>{
        await fetch(`/api/deleteMatch?matchID=${selectedMatch?.match_id}`, {
            method: 'DELETE',
        });
        
        window.location.reload();
    }

    useEffect(() => {
        const fetchAllMatches = async () => {
            try{
                const res = await fetch('/api/getAllMatches');
                const json = await res.json();

                console.log(json.allStraightMatches);

                if (!res.ok){
                    setError(json.error);
                }

                setAllMatches(json.allPoolMatches);
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
            <Header className={`home-title-box ${showSelectModal ? "blurred" : ""}`}>
            </Header>
            <div className={`history-box ${showSelectModal ? "blurred" : ""}`}>
                <button className="new-game" onClick={() => setShowSelectModal(true)}>+ New Game</button>

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
                        <p className="no-match-history-text">
                            No match history found. 
                        </p>
                        ) : (
                        <ul className="history-list">
                            {allMatches.map((match) => {
                                let currentScores = null;
                                let setsWonDisplay = null;

                                const lastRace = match.pool_matches_race?.[match.pool_matches_race.length - 1];
                                currentScores = lastRace ? `Score: ${lastRace.player1_score} -  ${lastRace.player2_score}` : "No race data";
        
                                if (match.pool_matches_sets){
                                    const player1SetWins = match.pool_matches_race?.filter(
                                        (race: any) => race.player1_score === match.race_to
                                    ).length ?? 0;
                                    const player2SetWins = match.pool_matches_race?.filter(
                                        (race: any) => race.player2_score === match.race_to
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
                                        <span className="history-score-text">
                                            {match.pool_matches_sets
                                            ? `${setsWonDisplay} | ${currentScores}`
                                            : currentScores}
                                        </span>
                                    </div>
                                    
                                    <div className="history-row">
                                        <span className="history-player-name-text">
                                            {match.player1} vs. {match.player2}
                                        </span>
                                        <span className="history-button-box">
                                            {match.winner === null && (
                                                <button className="history-button continue" onClick={() => router.push(`/tracker/8-ball?matchID=${match.match_id}`)}>
                                                    Continue Match
                                                </button>
                                            )}

                                        <button className="history-button view" onClick={() => {setShowDetailsModal(true); setSelectedMatch(match);}}>
                                            View Details
                                        </button>

                                        <button className="history-button delete" onClick={() => {setShowDeleteModal(true); setSelectedMatch(match);}}>
                                            Delete Match
                                        </button>
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

            {showSelectModal && (
                <div className="modal-overlay" onClick={() => setShowSelectModal(false)}>
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

            {showDetailsModal && selectedMatch && (
                <div className="details-modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
                        <p className="modal-game-type-text">
                            Game Type: {getGameTypeName(selectedMatch.game_type)}
                        </p>
                        <p className="modal-game-name-text">
                            Game Name: {selectedMatch.game_name}
                        </p>
                        <div className="modal-player-names-box">
                            <p className="modal-player-names-text">
                                {selectedMatch.player1}
                            </p>
                            <p className="modal-vs-text">
                                vs.
                            </p>
                            <p className="modal-player-names-text">
                                {selectedMatch.player2}
                            </p>
                        </div>
                        <p className="modal-winner-text">
                            Winner: {selectedMatch.winner || "In Progress"}
                        </p>

                        <img src="/divider.png" className="divider-css"></img>

                        <p className="modal-race-to-text">
                            Race to {selectedMatch.race_to}
                            {selectedMatch.pool_matches_sets?.sets !== null && selectedMatch.pool_matches_sets?.sets !== undefined && (
                                <>, Best of {selectedMatch.pool_matches_sets.sets}</>
                            )}
                        </p>
                        {selectedMatch.pool_matches_sets?.sets != null ? (
                            <>
                                <p className="modal-all-scores-text">All Scores:</p>
                                {selectedMatch.pool_matches_race?.length > 0 && (
                                <div className="modal-sets-grid" style={{gridTemplateColumns: `repeat(${Math.min(selectedMatch.pool_matches_race.length, 5)}, 1fr)`}}>
                                    {selectedMatch.pool_matches_race.map((race, index) => (
                                    <p className="modal-sets-scores-text" key={index}>
                                        Set {index + 1}: {race.player1_score} - {race.player2_score}
                                    </p>
                                    ))}
                                </div>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="modal-race-score-text">Score:</p>
                                {selectedMatch.pool_matches_race?.[0] && (
                                <p className="modal-race-scores-text">
                                    {selectedMatch.pool_matches_race[0].player1_score} - {selectedMatch.pool_matches_race[0].player2_score}
                                </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="delete-modal-overlay" onClick={() => {setShowDeleteModal(false)}}>
                    <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
                        <p className="delete-warning-text">
                            Are you sure you want to delete this match?
                        </p>
                        <p className="delete-warning-text">
                            This action is irreversible!
                        </p>
                        <div className="delete-button-box">
                            <div className="delete-confirm-button" onClick={deleteMatch}>
                                Confirm Delete
                            </div>
                            <div className="delete-cancel-button" onClick={() => {setShowDeleteModal(false)}}>
                                Cancel
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
