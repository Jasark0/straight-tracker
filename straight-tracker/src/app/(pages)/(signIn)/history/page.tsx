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

    type StraightMatch = {
        match_id: number,
        game_name: string;
        player1: string;
        player2: string;
        race_to: number;
        player1_score: number;
        player1_high_run: number;
        player2_score: number;
        player2_high_run: number;
        winner: string | null;
        created_at: string;
    }
    
    const router = useRouter();

    const [allPoolMatches, setAllPoolMatches] = useState<PoolMatch[]>([]);
    const [allStraightMatches, setAllStraightMatches] = useState<StraightMatch[]>([]);
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [selectedGame, setSelectedGame] = useState('');

    const [selectedPoolMatch, setSelectedPoolMatch] = useState<PoolMatch>();
    const [selectedStraightMatch, setSelectedStraightMatch] = useState<StraightMatch>();
    const [showPoolDetailsModal, setShowPoolDetailsModal] = useState(false);
    const [showStraightDetailsModal, setShowStraightDetailsModal] = useState(false);
    const [showDeletePoolModal, setShowDeletePoolModal] = useState(false);
    const [showDeleteStraightModal, setShowDeleteStraightModal] = useState(false);

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
    
    const deletePoolMatch = async () =>{
        await fetch(`/api/deletePoolMatch?matchID=${selectedPoolMatch?.match_id}`, {
            method: 'DELETE',
        });
        
        window.location.reload();
    }

    const deleteStraightMatch = async () =>{
        await fetch(`/api/deleteStraightMatch?matchID=${selectedStraightMatch?.match_id}`, {
            method: 'DELETE',
        });
        
        window.location.reload();
    }

    useEffect(() => {
        const fetchAllMatches = async () => {
            try{
                const res = await fetch('/api/getAllMatches');
                const json = await res.json();

                if (!res.ok){
                    setError(json.error);
                }

                setAllPoolMatches(json.allPoolMatches);
                setAllStraightMatches(json.allStraightMatches);
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
                </div>

                <div className="display-history-box">
                    <div className="history-placeholder-box">
                        {allPoolMatches.length === 0 ? (
                        <p className="no-match-history-text">
                            No match history found. 
                        </p>
                        ) : (
                        <ul className="history-list">
                            {allPoolMatches.map((match) => {
                                const lastRace = match.pool_matches_race?.[match.pool_matches_race.length - 1];

                                let currentPlayer1Sets: number = 0;
                                let currentPlayer2Sets: number = 0;
                                const currentPlayer1Score: number = lastRace.player1_score;
                                const currentPlayer2Score: number = lastRace.player2_score;
        
                                if (match.pool_matches_sets){
                                    currentPlayer1Sets = match.pool_matches_race?.filter(
                                        (race: any) => race.player1_score === match.race_to
                                    ).length ?? 0;
                                    currentPlayer2Sets = match.pool_matches_race?.filter(
                                        (race: any) => race.player2_score === match.race_to
                                    ).length ?? 0;
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
                                                ? (
                                                    <>
                                                        Sets Score: <span className="current-player-sets-css">{currentPlayer1Sets}</span> - <span className="current-player-sets-css">{currentPlayer2Sets}</span> | 
                                                        Score: <span className="current-player-scores-css">{currentPlayer1Score}</span> - <span className="current-player-scores-css">{currentPlayer2Score}</span>
                                                    </>
                                                )
                                                : (
                                                    <>
                                                        Score: <span className="current-player-scores-css">{currentPlayer1Score}</span> - <span className="current-player-scores-css">{currentPlayer2Score}</span>
                                                    </>
                                                )}
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

                                                <button className="history-button view" onClick={() => {setShowPoolDetailsModal(true); setSelectedPoolMatch(match);}}>
                                                    View Details
                                                </button>

                                                <button className="history-button delete" onClick={() => {setShowDeletePoolModal(true); setSelectedPoolMatch(match);}}>
                                                    Delete Match
                                                </button>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                            {allStraightMatches.map((match) => {
                                return (
                                    <div key={match.match_id} className="history-item">
                                        <div className="history-row">
                                            <span className="game-type-text">Straight Pool (14.1 Continous)</span>
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
                                                Score: {match.player1_score} - {match.player2_score}
                                            </span>
                                        </div>
                                    
                                        <div className="history-row">
                                            <span className="history-player-name-text">
                                                {match.player1} vs. {match.player2}
                                            </span>
                                            <span className="history-button-box">
                                                {match.winner === null && (
                                                    <button className="history-button continue" onClick={() => router.push(`/tracker/straight-pool?matchID=${match.match_id}`)}>
                                                        Continue Match
                                                    </button>
                                                )}

                                                <button className="history-button view" onClick={() => {setShowStraightDetailsModal(true); setSelectedStraightMatch(match);}}>
                                                    View Details
                                                </button>

                                                <button className="history-button delete" onClick={() => {setShowDeleteStraightModal(true); setSelectedStraightMatch(match);}}>
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

            {showPoolDetailsModal && selectedPoolMatch && (
                <div className="details-modal-overlay" onClick={() => setShowPoolDetailsModal(false)}>
                    <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
                        <p className="modal-game-type-text">
                            Game Type: {getGameTypeName(selectedPoolMatch.game_type)}
                        </p>
                        <p className="modal-game-name-text">
                            Game Name: {selectedPoolMatch.game_name}
                        </p>
                        <div className="modal-player-names-box">
                            <p className="modal-player-names-text">
                                {selectedPoolMatch.player1}
                            </p>
                            <p className="modal-vs-text">
                                vs.
                            </p>
                            <p className="modal-player-names-text">
                                {selectedPoolMatch.player2}
                            </p>
                        </div>
                        <p className="modal-winner-text">
                            Winner: {selectedPoolMatch.winner || "In Progress"}
                        </p>

                        <img src="/divider.png" className="divider-css"></img>

                        <p className="modal-race-to-text">
                            Race to {selectedPoolMatch.race_to}
                            {selectedPoolMatch.pool_matches_sets?.sets !== null && selectedPoolMatch.pool_matches_sets?.sets !== undefined && (
                                <>, Best of {selectedPoolMatch.pool_matches_sets.sets}</>
                            )}
                        </p>
                        {selectedPoolMatch.pool_matches_sets?.sets != null ? (
                            <>
                                <p className="modal-all-scores-text">All Scores:</p>
                                {selectedPoolMatch.pool_matches_race?.length > 0 && (
                                <div className="modal-sets-grid" style={{gridTemplateColumns: `repeat(${Math.min(selectedPoolMatch.pool_matches_race.length, 5)}, 1fr)`}}>
                                    {selectedPoolMatch.pool_matches_race.map((race, index) => (
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
                                {selectedPoolMatch.pool_matches_race?.[0] && (
                                <p className="modal-race-scores-text">
                                    {selectedPoolMatch.pool_matches_race[0].player1_score} - {selectedPoolMatch.pool_matches_race[0].player2_score}
                                </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {showDeletePoolModal && (
                <div className="delete-modal-overlay" onClick={() => {setShowDeletePoolModal(false)}}>
                    <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
                        <p className="delete-warning-text">
                            Are you sure you want to delete this match?
                        </p>
                        <p className="delete-warning-text">
                            This action is irreversible!
                        </p>
                        <div className="delete-button-box">
                            <div className="delete-confirm-button" onClick={deletePoolMatch}>
                                Confirm Delete
                            </div>
                            <div className="delete-cancel-button" onClick={() => {setShowDeletePoolModal(false)}}>
                                Cancel
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showStraightDetailsModal && selectedStraightMatch && (
                <div className="details-modal-overlay" onClick={() => setShowStraightDetailsModal(false)}>
                    <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
                        <p className="modal-game-type-text">
                            Game Type: Straight Pool (14.1 Continuous)
                        </p>
                        <p className="modal-game-name-text">
                            Game Name: {selectedStraightMatch.game_name}
                        </p>
                        <div className="modal-player-names-box">
                            <p className="modal-player-names-text">
                                {selectedStraightMatch.player1}
                            </p>
                            <p className="modal-vs-text">
                                vs.
                            </p>
                            <p className="modal-player-names-text">
                                {selectedStraightMatch.player2}
                            </p>
                        </div>
                        <p className="modal-winner-text">
                            Winner: {selectedStraightMatch.winner || "In Progress"}
                        </p>

                        <img src="/divider.png" className="divider-css"></img>

                        <p className="modal-race-to-text">
                            Race to {selectedStraightMatch.race_to}
                        </p>

                        <p className="modal-race-score-text">Score:</p>

                        <p className="modal-race-scores-text">
                            {selectedStraightMatch.player1_score} - {selectedStraightMatch.player2_score}
                        </p>
                    </div>
                </div>
            )}

            {showDeleteStraightModal && (
                <div className="delete-modal-overlay" onClick={() => {setShowDeleteStraightModal(false)}}>
                    <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
                        <p className="delete-warning-text">
                            Are you sure you want to delete this match?
                        </p>
                        <p className="delete-warning-text">
                            This action is irreversible!
                        </p>
                        <div className="delete-button-box">
                            <div className="delete-confirm-button" onClick={deleteStraightMatch}>
                                Confirm Delete
                            </div>
                            <div className="delete-cancel-button" onClick={() => {setShowDeleteStraightModal(false)}}>
                                Cancel
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
