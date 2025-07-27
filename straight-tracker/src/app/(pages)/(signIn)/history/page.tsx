"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useMemo } from 'react'
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
        lag_winner: string;
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

    const [selectedGameType, setSelectedGameType] = useState('8-Ball');
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); //Sets a delay between new user search terms
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [playerName, setPlayerName] = useState("");
    const [debouncedPlayerName, setDebouncedPlayerName] = useState(playerName); //Sets a delay between new player name search terms

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

    const gameTypeMap: Record<string, number | "straight"> = {
        "8-Ball": 0,
        "9-Ball": 1,
        "10-Ball": 2
    };

    const gameTypeLabels: Record<number, string> = {
        0: "8-Ball",
        1: "9-Ball",
        2: "10-Ball",
    };
    
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

    const filteredMatches = useMemo(() => {
        const gameNameSearch = debouncedSearchTerm.toLowerCase();
        const playerNameSearch = debouncedPlayerName.toLowerCase();

        const filterByDate = (createdAt: string) => {
            const date = new Date(createdAt);
            const matchDate = date.toLocaleDateString("en-CA");
            if (startDate && matchDate < startDate) return false;
            if (endDate && matchDate > endDate) return false;
            return true;
        };

        if (selectedGameType === "straight-pool") {
            return allStraightMatches
            .filter((match) => match.game_name.toLowerCase().includes(gameNameSearch) && filterByDate(match.created_at) &&
            (match.player1.toLowerCase().includes(playerNameSearch.toLowerCase()) || match.player2.toLowerCase().includes(playerNameSearch.toLowerCase())))
            .map((match) => ({
                ...match,
                type: "straight" as const
            }));
        }

        const selected = gameTypeMap[selectedGameType];

        return allPoolMatches
            .filter((match) => match.game_type === selected && match.game_name.toLowerCase().includes(gameNameSearch) && filterByDate(match.created_at) &&
            (match.player1.toLowerCase().includes(playerNameSearch.toLowerCase()) || match.player2.toLowerCase().includes(playerNameSearch.toLowerCase())))
            .map((match) => ({
                ...match,
                type: "pool" as const
            }));
    }, [allPoolMatches, allStraightMatches, selectedGameType, debouncedSearchTerm, startDate, endDate, debouncedPlayerName]);

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
    
    useEffect(() => {
        if (searchTerm === "") {
            setDebouncedSearchTerm("");
            return;
        }

        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        if (playerName === "") {
            setDebouncedPlayerName("");
            return;
        }

        const handler = setTimeout(() => {
            setDebouncedPlayerName(playerName);
        }, 300);

        return () => clearTimeout(handler);
    }, [playerName]);

    return (
        <div className="history-page-box">
            <Header className={`home-title-box ${showSelectModal ? "blurred" : ""}`}>
            </Header>
            <div className={`history-box ${showSelectModal ? "blurred" : ""}`}>
                <button className="new-game" onClick={() => setShowSelectModal(true)}>+ New Game</button>

                <div className="display-history-container">
                    <div className="filter-box">
                        <p>Game to display:</p>
                        <div className="filter-grid">
                            {['8-Ball', '9-Ball', '10-Ball', 'straight-pool'].map((type) => (
                                <button
                                    key={type}
                                    className={`filter-button ${selectedGameType === type ? 'active' : ''} ${type === 'straight-pool' ? 'smaller-font' : ''}`}
                                    onClick={() => setSelectedGameType(type)}
                                >
                                    {type === 'straight-pool' ? <>Straight Pool <br/> (14.1 Continuous)</> : `${type}`}
                                </button>
                            ))}
                        </div> 
                        
                        <p>Search game name:</p>
                        <div className="search-input-wrapper">
                            <span className="search-icon">🔍</span>
                            <input className="search-input" placeholder="Search game name" onChange={(e) => setSearchTerm(e.target.value)}/>
                        </div>
                        

                        <p>Filter by date:</p>
                        <div className="date-filter-row">
                            <input type="date" className="date-input" placeholder="Start date" onChange={(e) => setStartDate(e.target.value)}/>
                            <input type="date" className="date-input" placeholder="End date" onChange={(e) => setEndDate(e.target.value)}/>
                        </div>

                        <p>Filter by player name:</p>
                        <div className="search-input-wrapper">
                            <span className="search-icon">🔍</span>
                            <input className="search-input" placeholder="Search player name" onChange={(e) => setPlayerName(e.target.value)}/>
                        </div>
                    </div>

                    <div className="display-history-box">
                        <div className="history-placeholder-box">
                            {filteredMatches.length === 0 ? (
                            <p className="no-match-history-text">
                                No match history found. 
                            </p>
                            ) : (
                                <ul className="history-list">
                                    {filteredMatches.map((match) => {
                                        if (match.type === "pool"){
                                            const lastRace = match.pool_matches_race?.[match.pool_matches_race.length - 1];
                                            
                                            let currentPlayer1Sets: number = 0;
                                            let currentPlayer2Sets: number = 0;
                                            const currentPlayer1Score: number = lastRace.player1_score;
                                            const currentPlayer2Score: number = lastRace.player2_score;
                    
                                            if (match.pool_matches_sets) {
                                                currentPlayer1Sets = match.pool_matches_race?.filter(
                                                    (race: any) => race.winner === 'player1'
                                                ).length ?? 0;

                                                currentPlayer2Sets = match.pool_matches_race?.filter(
                                                    (race: any) => race.winner === 'player2'
                                                ).length ?? 0;
                                            }

                                            return (
                                                <div key={match.match_id} className="history-item">
                                                    <div className="history-row">
                                                        <span className="game-type-text">{gameTypeLabels[match.game_type] ?? "None"}</span>
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
                                        }
                                        else if (match.type === 'straight'){
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
                                                            Score: <span className="current-player-scores-css">{match.player1_score}</span> - <span className="current-player-scores-css">{match.player2_score}</span>
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
                                        }
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showSelectModal && (
                <div className="modal-overlay" onClick={() => setShowSelectModal(false)}>
                    <div className="modal-content" onClick={gameSelect}>
                        <h2>Select a Game Type</h2>
                        <div className="game-options">
                            {["8 Ball", "9 Ball", "10 Ball", "Straight Pool (14.1 Continuous)"].map((game) => (
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
                            Game Type: {gameTypeLabels[selectedPoolMatch.game_type] ?? "None"}
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
                        <p className="modal-lag-winner-text">
                            Lag Winner: {selectedPoolMatch.lag_winner}
                        </p>
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
                                        Set {index + 1}: <span className="current-player-scores-css">{race.player1_score}</span> - <span className="current-player-scores-css">{race.player2_score}</span>
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
