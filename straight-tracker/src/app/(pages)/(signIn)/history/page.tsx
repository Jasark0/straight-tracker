"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useMemo } from 'react'
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const gameSelect = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();

        const target = e.target as HTMLElement;

        if (!target.closest(".game-option")){
            setSelectedGame('');
        }
    }

    const selectPage = (selectedGameType: string) => {
        if (selectedGameType === "8 Ball"){
            router.push('/select/8-ball');
        }
        else if (selectedGameType === "9 Ball"){
            router.push('/select/9-ball'); 
        }
        else if (selectedGameType === "10 Ball"){
            router.push('/select/10-ball');
        }
        else if (selectedGameType === "Straight Pool (14.1 Continuous)"){
            router.push('/select/straight-pool'); 
        }
    }

    const continuePoolMatchPage = (match: PoolMatch) => {    
        router.push(`/tracker/pool-games?matchID=${match.match_id}`);
    }

    const continueStraightMatchPage = (match: StraightMatch) => {
        router.push(`/tracker/straight-pool?matchID=${match.match_id}`);
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
    
    const deletePoolMatch = async () => {
        await fetch(`/api/deletePoolMatch?matchID=${selectedPoolMatch?.match_id}`, {
            method: 'DELETE',
        });
        
        window.location.reload();
    }

    const deleteStraightMatch = async () => {
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

    useEffect(() => { //Get all matches
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
    
    useEffect(() => { //Set a timeout to search game name
        if (searchTerm === "") {
            setDebouncedSearchTerm("");
            return;
        }

        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => { //Set a timeout to search player name
        if (playerName === "") {
            setDebouncedPlayerName("");
            return;
        }

        const handler = setTimeout(() => {
            setDebouncedPlayerName(playerName);
        }, 300);

        return () => clearTimeout(handler);
    }, [playerName]);

    useEffect(() => { //Toastify notification on reset password success
        const params = new URLSearchParams(window.location.search);

        if (params.get('success') === '1') {
            toast.success("Password updated successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });

            params.delete('success');
            router.replace(`${window.location.pathname}?${params.toString()}`);
        }
    }, [])

    return (
        <div className="history-page-container">
            <ToastContainer className="history-toast"/>
            <div className={`history-container ${showSelectModal ? "blurred" : ""}`}>
                <div className="history-new-game-container">
                    <button className="history-new-game-button" onClick={() => setShowSelectModal(true)}>+ New Game</button>
                </div>
                
                <div className="history-content-container">
                    <div className="history-filter-container">
                        <p className="history-filter-game-text">Game to display:</p>
                        <div className="history-filter-grid">
                            {['8-Ball', '9-Ball', '10-Ball', 'straight-pool'].map((type) => (
                                <button
                                    key={type}
                                    className={`history-filter-game-button ${selectedGameType === type ? 'active' : ''} ${type === 'straight-pool' ? 'smaller-font' : ''}`}
                                    onClick={() => setSelectedGameType(type)}
                                >
                                    {type === 'straight-pool' ? <>Straight Pool <br/> (14.1 Continuous)</> : `${type}`}
                                </button>
                            ))}
                        </div> 
                        
                        <p>Search game name:</p>
                        <div className="history-search-container">
                            <span className="history-search-icon">🔍</span>
                            <input className="history-search-input" placeholder="Search game name" onChange={(e) => setSearchTerm(e.target.value)}/>
                        </div>

                        <p>Filter by date:</p>
                        <div className="history-date-container">
                            <input type="date" className="history-date-input" placeholder="Start date" onChange={(e) => setStartDate(e.target.value)}/>
                            <input type="date" className="history-date-input" placeholder="End date" onChange={(e) => setEndDate(e.target.value)}/>
                        </div>

                        <p>Filter by player name:</p>
                        <div className="history-search-container">
                            <span className="history-search-icon">🔍</span>
                            <input className="history-search-input" placeholder="Search player name" onChange={(e) => setPlayerName(e.target.value)}/>
                        </div>
                    </div>
                    
                    <div className="history-matches-container">
                        {filteredMatches.length === 0 ? (
                        <p className="history-no-match-text">
                            No match history found. 
                        </p>
                        ) : (
                            <div>
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
                                            <div key={match.match_id} className="history-match-container">
                                                <div className="history-match-row-container">
                                                    <span className="history-match-game-type-text">{gameTypeLabels[match.game_type] ?? "None"}</span>
                                                    <span className="history-match-created-at-text">{new Date(match.created_at).toLocaleString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true, 
                                                    })}
                                                    </span>
                                                </div>

                                                <div className="history-match-row-container">
                                                    <span className="history-match-game-name-text">Game Name: {match.game_name}</span>
                                                    <span className="history-match-score-text">
                                                        {match.pool_matches_sets
                                                        ? (
                                                            <>
                                                                Sets Score: <span className="history-match-current-sets-text">{currentPlayer1Sets}</span> - <span className="history-match-current-sets-text">{currentPlayer2Sets}</span> | 
                                                                Score: <span className="history-match-current-scores-text">{currentPlayer1Score}</span> - <span className="history-match-current-scores-text">{currentPlayer2Score}</span>
                                                            </>
                                                        )
                                                        : (
                                                            <>
                                                                Score: <span className="history-match-current-scores-text">{currentPlayer1Score}</span> - <span className="history-match-current-scores-text">{currentPlayer2Score}</span>
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                                
                                                <div className="history-match-row-container">
                                                    <span className="history-match-player-name-text">
                                                        {match.player1} vs. {match.player2}
                                                    </span>
                                                    <span className="history-match-button-container">
                                                        {match.winner === null && (
                                                            <button className="history-match-button continue" onClick={() => continuePoolMatchPage(match)}>
                                                                Continue Match
                                                            </button>
                                                        )}

                                                        <button className="history-match-button view" onClick={() => {setShowPoolDetailsModal(true); setSelectedPoolMatch(match);}}>
                                                            View Details
                                                        </button>

                                                        <button className="history-match-button delete" onClick={() => {setShowDeletePoolModal(true); setSelectedPoolMatch(match);}}>
                                                            Delete Match
                                                        </button>
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    else if (match.type === 'straight'){
                                        return (
                                            <div key={match.match_id} className="history-match-container">
                                                <div className="history-match-row-container">
                                                    <span className="history-match-game-type-text">Straight Pool (14.1 Continuous)</span>
                                                    <span className="history-match-created-at-text">{new Date(match.created_at).toLocaleString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true, 
                                                    })}
                                                    </span>
                                                </div>

                                                <div className="history-match-row-container">
                                                    <span className="history-match-game-name-text">Game Name: {match.game_name}</span>
                                                    <span className="history-match-score-text">
                                                        Score: <span className="history-match-current-scores-text">{match.player1_score}</span> - <span className="history-match-current-scores-text">{match.player2_score}</span>
                                                    </span>
                                                </div>
                                            
                                                <div className="history-match-row-container">
                                                    <span className="history-match-player-name-text">
                                                        {match.player1} vs. {match.player2}
                                                    </span>
                                                    <span className="history-match-button-container">
                                                        {match.winner === null && (
                                                            <button className="history-match-button continue" onClick={() => {continueStraightMatchPage(match)}}>
                                                                Continue Match
                                                            </button>
                                                        )}

                                                        <button className="history-match-button view" onClick={() => {setShowStraightDetailsModal(true); setSelectedStraightMatch(match);}}>
                                                            View Details
                                                        </button>

                                                        <button className="history-match-button delete" onClick={() => {setShowDeleteStraightModal(true); setSelectedStraightMatch(match);}}>
                                                            Delete Match
                                                        </button>
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showSelectModal && (
                <div className="history-select-modal" onClick={() => setShowSelectModal(false)}>
                    <div className="history-select-modal-content" onClick={gameSelect}>
                        <div className="history-select-modal-close" onClick={() => setShowSelectModal(false)}>
                            &times;
                        </div>
                        <h2>Select a Game Type</h2>
                        <div className="history-select-game-options">
                            {["8 Ball", "9 Ball", "10 Ball", "Straight Pool (14.1 Continuous)"].map((game) => (
                                <button className="history-select-game-option" key={game} onClick={() => selectPage(game)}>
                                    {game}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showPoolDetailsModal && selectedPoolMatch && (
                <div className="history-details-modal" onClick={() => setShowPoolDetailsModal(false)}>
                    <div className="history-details-content" onClick={(e) => e.stopPropagation()}>
                        <div className="history-details-modal-close" onClick={() => setShowPoolDetailsModal(false)}>
                            &times;
                        </div>
                        <p className="history-details-game-type-text">
                            Game Type: {gameTypeLabels[selectedPoolMatch.game_type] ?? "None"}
                        </p>
                        <p className="history-details-game-name-text">
                            Game Name: {selectedPoolMatch.game_name}
                        </p>
                        <p className="history-details-player-names-text">
                            {selectedPoolMatch.player1} vs. {selectedPoolMatch.player2}
                        </p>
                        <p className="history-details-winner-text">
                            Lag Winner: {selectedPoolMatch.lag_winner}, Winner: {selectedPoolMatch.winner || "In Progress"}
                        </p>

                        <img src="/divider.png" className="divider-css"></img>

                        <p className="history-details-race-to-text">
                            Race to {selectedPoolMatch.race_to}
                            {selectedPoolMatch.pool_matches_sets?.sets !== null && selectedPoolMatch.pool_matches_sets?.sets !== undefined && (
                                <>, Best of {selectedPoolMatch.pool_matches_sets.sets}</>
                            )}
                        </p>
                        {selectedPoolMatch.pool_matches_sets?.sets != null ? (
                            <>
                                <p className="history-details-all-scores-text">All Scores:</p>
                                {selectedPoolMatch.pool_matches_race?.length > 0 && (
                                    <div className="history-details-sets-grid" style={{gridTemplateColumns: `repeat(${Math.min(selectedPoolMatch.pool_matches_race.length, 5)}, 1fr)`}}>
                                        {selectedPoolMatch.pool_matches_race.map((race, index) => (
                                            <p className="history-details-sets-scores-text" key={index}>
                                                Set {index + 1}: <span className="history-match-current-scores-text">{race.player1_score}</span> - <span className="history-match-current-scores-text">{race.player2_score}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="history-details-race-score-text">Score:</p>
                                {selectedPoolMatch.pool_matches_race?.[0] && (
                                    <p className="history-details-race-scores-text">
                                        {selectedPoolMatch.pool_matches_race[0].player1_score} - {selectedPoolMatch.pool_matches_race[0].player2_score}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {showDeletePoolModal && (
                <div className="history-delete-modal" onClick={() => {setShowDeletePoolModal(false)}}>
                    <div className="history-delete-modal-content" onClick={(e) => e.stopPropagation()}>
                        <p className="history-delete-warning-text">
                            Are you sure you want to delete this match?
                        </p>
                        <p className="history-delete-warning-text">
                            This action is irreversible!
                        </p>
                        <div className="history-delete-button-container">
                            <div className="history-delete-confirm-button" onClick={deletePoolMatch}>
                                Confirm Delete
                            </div>
                            <div className="history-delete-cancel-button" onClick={() => {setShowDeletePoolModal(false)}}>
                                Cancel
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showStraightDetailsModal && selectedStraightMatch && (
                <div className="history-details-modal" onClick={() => setShowStraightDetailsModal(false)}>
                    <div className="history-details-content" onClick={(e) => e.stopPropagation()}>
                        <p className="history-details-game-type-text">
                            Game Type: Straight Pool (14.1 Continuous)
                        </p>
                        <p className="history-details-game-name-text">
                            Game Name: {selectedStraightMatch.game_name}
                        </p>
                        <div className="history-details-player-names-container">
                            <p className="history-details-player-names-text">
                                {selectedStraightMatch.player1} vs. {selectedStraightMatch.player2}
                            </p>
                        </div>
                        <p className="history-details-winner-text">
                            Winner: {selectedStraightMatch.winner || "In Progress"}
                        </p>

                        <img src="/divider.png" className="divider-css"></img>

                        <p className="history-details-race-to-text">
                            Race to {selectedStraightMatch.race_to}
                        </p>
                        <p className="history-details-race-score-text">Score:</p>
                        <p className="history-details-race-scores-text">
                            {selectedStraightMatch.player1_score} - {selectedStraightMatch.player2_score}
                        </p>
                    </div>
                </div>
            )}
            
            {showDeleteStraightModal && (
                <div className="history-delete-modal" onClick={() => {setShowDeleteStraightModal(false)}}>
                    <div className="history-delete-modal-content" onClick={(e) => e.stopPropagation()}>
                        <p className="history-delete-warning-text">
                            Are you sure you want to delete this match?
                        </p>
                        <p className="history-delete-warning-text">
                            This action is irreversible!
                        </p>
                        <div className="history-delete-button-container">
                            <div className="history-delete-confirm-button" onClick={deleteStraightMatch}>
                                Confirm Delete
                            </div>
                            <div className="history-delete-cancel-button" onClick={() => {setShowDeleteStraightModal(false)}}>
                                Cancel
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
